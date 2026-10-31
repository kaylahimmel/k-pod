import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, AppState, Linking } from 'react-native';
import { usePodcastStore, useSettingsStore } from '../../hooks';
import {
  NotificationService,
  registerBackgroundRefresh,
  unregisterBackgroundRefresh,
} from '../../services';
import { formatNotificationPodcasts } from './NotificationSettingsPresenter';
import { NotificationSettingsViewModelReturn } from './NotificationSettings.types';

/**
 * ViewModel hook for the Notifications modal
 * Combines the saved preference with the device's actual permission
 */
export const useNotificationSettingsViewModel =
  (): NotificationSettingsViewModelReturn => {
    const { settings, updateSetting } = useSettingsStore();
    const { podcasts } = usePodcastStore();

    // null until the first check finishes, so the toggle doesn't flicker off
    const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
      null,
    );

    // The saved setting only records what the user chose in the app. They can
    // revoke permission in device settings at any time, and the OS doesn't
    // tell the app, so the toggle has to combine both. The saved preference
    // is deliberately left alone: if permission comes back, alerts do too.
    const alertsEnabled =
      settings.newEpisodeNotifications && permissionGranted !== false;
    const isBlockedByDevice =
      settings.newEpisodeNotifications && permissionGranted === false;

    // One notification row per subscribed podcast, enabled unless muted
    const notificationPodcasts = useMemo(
      () =>
        formatNotificationPodcasts(
          podcasts,
          settings.mutedNotificationPodcastIds,
        ),
      [podcasts, settings.mutedNotificationPodcastIds],
    );

    /**
     * Re-reads the device permission when this screen opens and whenever the
     * app returns to the foreground, which is how users come back after
     * changing it in device settings. iOS keeps the app running through that
     * change, so nothing else would trigger a fresh check.
     */
    useEffect(() => {
      const checkPermission = async () => {
        const result = await NotificationService.getPermissionStatus();
        if (result.success) {
          setPermissionGranted(result.data);
        }
      };

      checkPermission();
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          checkPermission();
        }
      });
      return () => subscription.remove();
    }, []);

    /**
     * Opens this app's page in the device's Settings app
     */
    const handleOpenDeviceSettings = useCallback(() => {
      Linking.openSettings().catch(() => {
        Alert.alert('Error', 'Unable to open device settings.');
      });
    }, []);

    /**
     * Turns new-episode alerts on or off (the master toggle).
     *
     * Turning ON asks for notification permission here, at the moment the user
     * shows intent, rather than at app launch: iOS only ever shows the system
     * prompt once, and a prompt with no context is usually denied. The setting
     * only flips to true after permission is granted AND the background task
     * is registered, so the switch never shows "on" for alerts that can't fire.
     *
     * Turning OFF saves the setting first (instant UI feedback), then stops
     * the background task so the OS no longer wakes the app for it.
     */
    const handleToggleNotifications = useCallback(async () => {
      if (alertsEnabled) {
        updateSetting('newEpisodeNotifications', false);
        const result = await unregisterBackgroundRefresh();
        if (!result.success) {
          // The task bails when the setting is off, so this is harmless
          console.error(result.error);
        }
        return;
      }

      const permission = await NotificationService.requestPermission();
      if (!permission.success) {
        Alert.alert('Error', permission.error);
        return;
      }

      setPermissionGranted(permission.data);

      // Denied: the OS won't prompt again, so the only way forward is the
      // system Settings app. The toggle stays off.
      if (!permission.data) {
        Alert.alert(
          'Notifications Are Off',
          'To get new episode alerts, allow notifications for K-Pod in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: handleOpenDeviceSettings },
          ],
        );
        return;
      }

      const registration = await registerBackgroundRefresh();
      if (!registration.success) {
        Alert.alert('Error', registration.error);
        return;
      }

      updateSetting('newEpisodeNotifications', true);
    }, [alertsEnabled, updateSetting, handleOpenDeviceSettings]);

    /**
     * Mutes or unmutes alerts for one podcast by adding/removing its id
     * from the muted list (keyed by podcast.id)
     */
    const handleTogglePodcastNotifications = useCallback(
      (podcastId: string) => {
        const muted = settings.mutedNotificationPodcastIds;
        const nextMuted = muted.includes(podcastId)
          ? muted.filter((id) => id !== podcastId)
          : [...muted, podcastId];
        updateSetting('mutedNotificationPodcastIds', nextMuted);
      },
      [settings.mutedNotificationPodcastIds, updateSetting],
    );

    return {
      alertsEnabled,
      isBlockedByDevice,
      notificationPodcasts,
      handleToggleNotifications,
      handleTogglePodcastNotifications,
      handleOpenDeviceSettings,
    };
  };
