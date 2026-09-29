import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  NotificationService,
  NEW_EPISODES_CHANNEL_ID,
} from '../NotificationService';
import { RefreshResult } from '../RefreshService';
import { createMockEpisode } from '../../__mocks__';

const createResult = (
  overrides: Partial<RefreshResult> = {},
): RefreshResult => ({
  podcastId: 'p1',
  podcastTitle: 'Podcast One',
  success: true,
  newEpisodeCount: 0,
  newEpisodes: [],
  ...overrides,
});

const withNewEpisodes = (
  podcastId: string,
  podcastTitle: string,
  titles: string[],
): RefreshResult =>
  createResult({
    podcastId,
    podcastTitle,
    newEpisodeCount: titles.length,
    newEpisodes: titles.map((title, i) =>
      createMockEpisode({ id: `${podcastId}-ep${i}`, title }),
    ),
  });

const enabled = {
  newEpisodeNotifications: true,
  mutedNotificationPodcastIds: [],
};

describe('NotificationService', () => {
  const originalOS = Platform.OS;
  // setNotificationHandler runs once at import; copy the calls before
  // beforeEach's clearAllMocks wipes them
  const handlerCalls = (
    Notifications.setNotificationHandler as jest.Mock
  ).mock.calls.slice();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    Platform.OS = originalOS;
  });

  it('registers a foreground notification handler at load', () => {
    // Registered at module scope, so it was captured before clearAllMocks
    const handler = handlerCalls[0][0];
    return expect(handler.handleNotification()).resolves.toEqual({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    });
  });

  describe('requestPermission', () => {
    it('returns true without prompting when already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        granted: true,
      });

      const result = await NotificationService.requestPermission();

      expect(result).toEqual({ success: true, data: true });
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('prompts and returns the granted result', async () => {
      (
        Notifications.requestPermissionsAsync as jest.Mock
      ).mockResolvedValueOnce({ granted: true });

      const result = await NotificationService.requestPermission();

      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: true });
    });

    it('returns false when the user denies', async () => {
      (
        Notifications.requestPermissionsAsync as jest.Mock
      ).mockResolvedValueOnce({ granted: false });

      const result = await NotificationService.requestPermission();

      expect(result).toEqual({ success: true, data: false });
    });

    it('creates the Android channel before asking (required on Android 13+)', async () => {
      Platform.OS = 'android';

      await NotificationService.requestPermission();

      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
        NEW_EPISODES_CHANNEL_ID,
        expect.objectContaining({ name: 'New episodes' }),
      );
    });

    it('skips the channel on iOS', async () => {
      Platform.OS = 'ios';

      await NotificationService.requestPermission();

      expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
    });

    it('returns a failure result when the native call throws', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockRejectedValueOnce(
        new Error('boom'),
      );

      const result = await NotificationService.requestPermission();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('boom');
      }
    });
  });

  describe('buildNewEpisodeNotifications', () => {
    it('returns nothing when the master toggle is off', () => {
      const notifications = NotificationService.buildNewEpisodeNotifications(
        [withNewEpisodes('p1', 'Podcast One', ['Ep A'])],
        { newEpisodeNotifications: false, mutedNotificationPodcastIds: [] },
      );

      expect(notifications).toEqual([]);
    });

    it('uses the episode title as the body for a single new episode', () => {
      const notifications = NotificationService.buildNewEpisodeNotifications(
        [withNewEpisodes('p1', 'Podcast One', ['Ep A'])],
        enabled,
      );

      expect(notifications).toEqual([
        { podcastId: 'p1', title: 'Podcast One', body: 'Ep A' },
      ]);
    });

    it('uses a count as the body for several new episodes', () => {
      const notifications = NotificationService.buildNewEpisodeNotifications(
        [withNewEpisodes('p1', 'Podcast One', ['Ep A', 'Ep B', 'Ep C'])],
        enabled,
      );

      expect(notifications).toEqual([
        { podcastId: 'p1', title: 'Podcast One', body: '3 new episodes' },
      ]);
    });

    it('skips muted podcasts', () => {
      const notifications = NotificationService.buildNewEpisodeNotifications(
        [
          withNewEpisodes('p1', 'Podcast One', ['Ep A']),
          withNewEpisodes('p2', 'Podcast Two', ['Ep B']),
        ],
        { newEpisodeNotifications: true, mutedNotificationPodcastIds: ['p1'] },
      );

      expect(notifications.map((n) => n.podcastId)).toEqual(['p2']);
    });

    it('skips failed refreshes and podcasts with no new episodes', () => {
      const notifications = NotificationService.buildNewEpisodeNotifications(
        [
          createResult({ podcastId: 'p1', success: false, error: 'offline' }),
          createResult({ podcastId: 'p2' }),
        ],
        enabled,
      );

      expect(notifications).toEqual([]);
    });
  });

  describe('notifyNewEpisodes', () => {
    it('schedules one immediate notification per podcast on iOS', async () => {
      Platform.OS = 'ios';

      const result = await NotificationService.notifyNewEpisodes(
        [
          withNewEpisodes('p1', 'Podcast One', ['Ep A']),
          withNewEpisodes('p2', 'Podcast Two', ['Ep B', 'Ep C']),
        ],
        enabled,
      );

      expect(result).toEqual({ success: true, data: 2 });
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Podcast Two',
          body: '2 new episodes',
          data: { podcastId: 'p2' },
        },
        trigger: null,
      });
    });

    it('posts to the new-episodes channel on Android', async () => {
      Platform.OS = 'android';

      await NotificationService.notifyNewEpisodes(
        [withNewEpisodes('p1', 'Podcast One', ['Ep A'])],
        enabled,
      );

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: { channelId: NEW_EPISODES_CHANNEL_ID },
        }),
      );
    });

    it('schedules nothing when there is nothing to notify', async () => {
      const result = await NotificationService.notifyNewEpisodes(
        [withNewEpisodes('p1', 'Podcast One', ['Ep A'])],
        { newEpisodeNotifications: true, mutedNotificationPodcastIds: ['p1'] },
      );

      expect(result).toEqual({ success: true, data: 0 });
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('returns a failure result when scheduling throws', async () => {
      (
        Notifications.scheduleNotificationAsync as jest.Mock
      ).mockRejectedValueOnce(new Error('not allowed'));

      const result = await NotificationService.notifyNewEpisodes(
        [withNewEpisodes('p1', 'Podcast One', ['Ep A'])],
        enabled,
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('not allowed');
      }
    });
  });
});
