import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { NotificationSettingsView } from '../NotificationSettingsView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { podcastStore, queueStore, settingsStore } from '../../../stores';
import { STORAGE_KEYS } from '../../../constants';
import {
  createMockAppSettings,
  createMockEpisode,
  createMockPodcast,
} from '../../../__mocks__';

const mockGetPermissions = Notifications.getPermissionsAsync as jest.Mock;

describe('NotificationSettingsView', () => {
  const subscribe = () =>
    podcastStore.setState({
      podcasts: [
        createMockPodcast({ id: 'p1', title: 'Podcast One' }),
        createMockPodcast({ id: 'p2', title: 'Podcast Two' }),
      ],
    });

  const enableNotifications = (mutedIds: string[] = []) =>
    settingsStore.setState({
      settings: createMockAppSettings({
        newEpisodeNotifications: true,
        mutedNotificationPodcastIds: mutedIds,
      }),
    });

  // Renders and waits for the permission check that runs on open
  const renderView = async () => {
    const view = render(<NotificationSettingsView />);
    await waitFor(() => expect(mockGetPermissions).toHaveBeenCalled());
    return view;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPermissions.mockResolvedValue({ granted: true });
    settingsStore.setState({
      settings: createMockAppSettings(),
      loading: false,
      error: null,
    });
    podcastStore.setState({ podcasts: [] });
  });

  it('should display the master toggle', async () => {
    const { getByText } = await renderView();

    expect(getByText('New episode alerts')).toBeTruthy();
  });

  it('should hide per-podcast toggles while alerts are off', async () => {
    subscribe();

    const { queryByText } = await renderView();

    expect(queryByText('Podcast One')).toBeNull();
  });

  it('should show a toggle per podcast while alerts are on', async () => {
    subscribe();
    enableNotifications(['p2']);

    const { findByText, getAllByTestId } = await renderView();

    expect(await findByText('Podcast One')).toBeTruthy();
    const switches = getAllByTestId('setting-toggle-switch');
    expect(switches[1].props.value).toBe(true);
    expect(switches[2].props.value).toBe(false);
  });

  it('should show a hint when alerts are on with no subscriptions', async () => {
    enableNotifications();

    const { findByText } = await renderView();

    expect(
      await findByText(
        'Subscribe to a podcast to choose which shows send alerts.',
      ),
    ).toBeTruthy();
  });

  it('should mute a podcast when its toggle is switched off', async () => {
    subscribe();
    enableNotifications();

    const { findAllByTestId } = await renderView();
    const switches = await findAllByTestId('setting-toggle-switch');
    fireEvent(switches[1], 'valueChange', false);

    expect(
      settingsStore.getState().settings.mutedNotificationPodcastIds,
    ).toEqual(['p1']);
  });

  it('should turn alerts on once permission is granted', async () => {
    const { getByTestId } = await renderView();

    fireEvent(getByTestId('setting-toggle-switch'), 'valueChange', true);

    await waitFor(() => {
      expect(settingsStore.getState().settings.newEpisodeNotifications).toBe(
        true,
      );
    });
  });

  it('should show the toggle off with a way to fix it when permission was revoked', async () => {
    mockGetPermissions.mockResolvedValue({ granted: false });
    subscribe();
    enableNotifications();

    const { findByText, getByTestId, queryByText } = await renderView();

    expect(await findByText('Open Device Settings')).toBeTruthy();
    expect(getByTestId('setting-toggle-switch').props.value).toBe(false);
    expect(queryByText('Podcast One')).toBeNull();
  });

  describe('queue safety', () => {
    const queueItems = [
      {
        id: 'item-1',
        episode: createMockEpisode({ id: 'episode-1' }),
        podcast: createMockPodcast({ id: 'p1' }),
        position: 0,
      },
      {
        id: 'item-2',
        episode: createMockEpisode({ id: 'episode-2' }),
        podcast: createMockPodcast({ id: 'p1' }),
        position: 1,
      },
    ];

    const queueWrites = () =>
      (AsyncStorage.setItem as jest.Mock).mock.calls.filter(
        ([key]) => key === STORAGE_KEYS.QUEUE,
      );

    beforeEach(() => {
      queueStore.setState({ queue: queueItems, currentIndex: 1 });
      (AsyncStorage.setItem as jest.Mock).mockClear();
    });

    const expectQueueUntouched = () => {
      expect(queueStore.getState().queue).toEqual(queueItems);
      expect(queueStore.getState().currentIndex).toBe(1);
      expect(queueWrites()).toHaveLength(0);
    };

    it('should leave the queue alone when alerts are turned on', async () => {
      const { getByTestId } = await renderView();

      fireEvent(getByTestId('setting-toggle-switch'), 'valueChange', true);

      await waitFor(() => {
        expect(settingsStore.getState().settings.newEpisodeNotifications).toBe(
          true,
        );
      });
      expectQueueUntouched();
    });

    it('should leave the queue alone when alerts are turned off', async () => {
      enableNotifications();
      const { findAllByTestId } = await renderView();
      const [masterToggle] = await findAllByTestId('setting-toggle-switch');

      fireEvent(masterToggle, 'valueChange', false);

      await waitFor(() => {
        expect(settingsStore.getState().settings.newEpisodeNotifications).toBe(
          false,
        );
      });
      expectQueueUntouched();
    });

    it('should leave the queue alone when permission was revoked', async () => {
      mockGetPermissions.mockResolvedValue({ granted: false });
      enableNotifications();

      const { findByText } = await renderView();

      await findByText('Open Device Settings');
      expectQueueUntouched();
    });
  });
});
