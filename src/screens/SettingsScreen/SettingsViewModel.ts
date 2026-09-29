import { useCallback, useMemo } from 'react';
import { Alert, Linking } from 'react-native';
import { PlaybackSpeed } from '../../models';
import { usePodcastStore, useSettingsStore } from '../../hooks';
import {
  NotificationService,
  registerBackgroundRefresh,
  unregisterBackgroundRefresh,
} from '../../services';
import {
  formatNotificationPodcasts,
  formatSettings,
  getAppVersion,
  SPEED_OPTIONS,
  SKIP_FORWARD_OPTIONS,
  SKIP_BACKWARD_OPTIONS,
} from './SettingsPresenter';
import { SettingsViewModelReturn } from './Settings.types';

// Placeholder URLs for legal pages
const PRIVACY_POLICY_URL = 'https://example.com/privacy';
const TERMS_OF_SERVICE_URL = 'https://example.com/terms';

/**
 * ViewModel hook for the Settings screen
 * Manages settings state and provides handlers for user interactions
 */
export const useSettingsViewModel = (): SettingsViewModelReturn => {
  // Store access
  const { settings, loading, updateSetting, resetSettings } =
    useSettingsStore();
  const { podcasts } = usePodcastStore();

  // Formatted settings from presenter
  const formattedSettings = useMemo(() => formatSettings(settings), [settings]);

  // App version from presenter
  const appVersion = useMemo(() => getAppVersion(), []);

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
   * Toggles the auto-play next episode setting
   */
  const handleToggleAutoPlayNext = useCallback(() => {
    updateSetting('autoPlayNext', !settings.autoPlayNext);
  }, [settings.autoPlayNext, updateSetting]);

  /**
   * Updates the default playback speed
   */
  const handleSpeedChange = useCallback(
    (speed: PlaybackSpeed) => {
      updateSetting('defaultSpeed', speed);
    },
    [updateSetting],
  );

  /**
   * Toggles the download on WiFi only setting
   */
  const handleToggleDownloadOnWiFi = useCallback(() => {
    updateSetting('downloadOnWiFi', !settings.downloadOnWiFi);
  }, [settings.downloadOnWiFi, updateSetting]);

  /**
   * Updates the skip forward duration
   */
  const handleSkipForwardChange = useCallback(
    (seconds: number) => {
      updateSetting('skipForwardSeconds', seconds);
    },
    [updateSetting],
  );

  /**
   * Updates the skip backward duration
   */
  const handleSkipBackwardChange = useCallback(
    (seconds: number) => {
      updateSetting('skipBackwardSeconds', seconds);
    },
    [updateSetting],
  );

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
    if (settings.newEpisodeNotifications) {
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

    // Denied: the OS won't prompt again, so the only way forward is the
    // system Settings app. The toggle stays off.
    if (!permission.data) {
      Alert.alert(
        'Notifications Are Off',
        'To get new episode alerts, allow notifications for K-Pod in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings().catch(() => {
                Alert.alert('Error', 'Unable to open device settings.');
              });
            },
          },
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
  }, [settings.newEpisodeNotifications, updateSetting]);

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

  /**
   * Resets all settings to defaults with confirmation
   */
  const handleResetSettings = useCallback(() => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to their defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetSettings();
            // Defaults turn notifications off, so stop the background task
            // too instead of leaving the OS waking the app for nothing
            unregisterBackgroundRefresh().catch(() => {});
          },
        },
      ],
    );
  }, [resetSettings]);

  /**
   * Opens the privacy policy in the device browser
   */
  const handlePrivacyPolicyPress = useCallback(async () => {
    // TODO: Replace with actual privacy policy URL when available
    try {
      await Linking.openURL(PRIVACY_POLICY_URL);
    } catch {
      Alert.alert('Error', 'Unable to open privacy policy.');
    }
  }, []);

  /**
   * Opens the terms of service in the device browser
   */
  const handleTermsOfServicePress = useCallback(async () => {
    // TODO: Replace with actual terms of service URL when available
    try {
      await Linking.openURL(TERMS_OF_SERVICE_URL);
    } catch {
      Alert.alert('Error', 'Unable to open terms of service.');
    }
  }, []);

  return {
    settings: formattedSettings,
    isLoading: loading,
    speedOptions: SPEED_OPTIONS,
    skipForwardOptions: SKIP_FORWARD_OPTIONS,
    skipBackwardOptions: SKIP_BACKWARD_OPTIONS,
    appVersion,
    notificationPodcasts,
    handleToggleAutoPlayNext,
    handleSpeedChange,
    handleToggleDownloadOnWiFi,
    handleSkipForwardChange,
    handleSkipBackwardChange,
    handleToggleNotifications,
    handleTogglePodcastNotifications,
    handleResetSettings,
    handlePrivacyPolicyPress,
    handleTermsOfServicePress,
  };
};

export type SettingsViewModel = ReturnType<typeof useSettingsViewModel>;
