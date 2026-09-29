import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AppSettings, ServiceResult } from '../models';
import { RefreshResult } from './RefreshService';

/**
 * Android groups notifications into user-visible "channels" (Settings → Apps →
 * K-Pod → Notifications). Android 13+ also won't show the permission prompt
 * until at least one channel exists, so the channel is created before asking.
 */
export const NEW_EPISODES_CHANNEL_ID = 'new-episodes';

/** One notification's text, built per podcast */
export interface NewEpisodeNotification {
  podcastId: string;
  title: string;
  body: string;
}

/** The two settings that decide whether (and for whom) to notify */
type NotificationSettings = Pick<
  AppSettings,
  'newEpisodeNotifications' | 'mutedNotificationPodcastIds'
>;

// Controls how a notification behaves if it arrives while the app is open.
// Without a handler, expo-notifications silently drops foreground
// notifications. Background refresh usually fires while the app is closed,
// but it can also run while the app is merely backgrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

/**
 * Creates the Android notification channel. No-op on iOS.
 * Safe to call repeatedly: Android updates the existing channel in place.
 */
async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(NEW_EPISODES_CHANNEL_ID, {
    name: 'New episodes',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/**
 * Asks the OS for permission to show notifications.
 *
 * `data` is true when notifications are allowed. If permission was already
 * granted the OS isn't asked again; if it was denied, iOS won't show the
 * prompt a second time, so `data` comes back false and the caller should
 * point the user at the system Settings app instead.
 */
async function requestPermission(): Promise<ServiceResult<boolean>> {
  try {
    await ensureAndroidChannel();

    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted) {
      return { success: true, data: true };
    }

    const requested = await Notifications.requestPermissionsAsync();
    return { success: true, data: requested.granted };
  } catch (error) {
    return {
      success: false,
      error: `Failed to request notification permission: ${getErrorMessage(error)}`,
    };
  }
}

/**
 * Pure function: turns refresh results into notification text.
 *
 * - Returns nothing when the master toggle is off
 * - Skips podcasts the user muted, failed refreshes, and podcasts with no
 *   new episodes
 * - One notification per podcast: a single new episode shows its title,
 *   several show a count, so a busy feed doesn't flood the lock screen
 */
function buildNewEpisodeNotifications(
  results: RefreshResult[],
  settings: NotificationSettings,
): NewEpisodeNotification[] {
  if (!settings.newEpisodeNotifications) return [];

  const muted = new Set(settings.mutedNotificationPodcastIds);

  return results
    .filter(
      (result) =>
        result.success &&
        result.newEpisodes.length > 0 &&
        !muted.has(result.podcastId),
    )
    .map((result) => ({
      podcastId: result.podcastId,
      title: result.podcastTitle,
      body:
        result.newEpisodes.length === 1
          ? result.newEpisodes[0].title
          : `${result.newEpisodes.length} new episodes`,
    }));
}

/**
 * Shows a local notification for each podcast with new episodes.
 * `data` is the number of notifications shown.
 */
async function notifyNewEpisodes(
  results: RefreshResult[],
  settings: NotificationSettings,
): Promise<ServiceResult<number>> {
  const notifications = buildNewEpisodeNotifications(results, settings);
  if (notifications.length === 0) {
    return { success: true, data: 0 };
  }

  try {
    await ensureAndroidChannel();

    // On Android, the trigger carries the channel to post to; `null` would
    // post to expo's generic fallback channel. On iOS `null` means "now".
    const trigger: Notifications.NotificationTriggerInput =
      Platform.OS === 'android' ? { channelId: NEW_EPISODES_CHANNEL_ID } : null;

    await Promise.all(
      notifications.map((notification) =>
        Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title,
            body: notification.body,
            data: { podcastId: notification.podcastId },
          },
          trigger,
        }),
      ),
    );

    return { success: true, data: notifications.length };
  } catch (error) {
    return {
      success: false,
      error: `Failed to show new episode notifications: ${getErrorMessage(error)}`,
    };
  }
}

export const NotificationService = {
  requestPermission,
  buildNewEpisodeNotifications,
  notifyNewEpisodes,
};
