import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import {
  useAuthStore,
  useHistoryStore,
  useIsDarkMode,
  usePodcastStore,
  useSettingsStore,
  useToast,
} from '../../hooks';
import { AuthService, unregisterBackgroundRefresh } from '../../services';
import { formatAccount, getListeningStats } from './SettingsPresenter';
import { SettingsViewModelReturn } from './Settings.types';

/**
 * ViewModel hook for the Settings screen
 * Manages settings state and provides handlers for user interactions
 */
export const useSettingsViewModel = (): SettingsViewModelReturn => {
  // Store access
  const { settings, loading, updateSetting, resetSettings } =
    useSettingsStore();
  const toast = useToast();
  // The current look, whether it came from the phone or from this switch
  const isDarkMode = useIsDarkMode();

  // Account and Listening sections (moved here from the old Profile tab)
  const { user } = useAuthStore();
  const { podcasts } = usePodcastStore();
  const { history } = useHistoryStore();
  const account = useMemo(() => formatAccount(user), [user]);
  const listeningStats = useMemo(
    () => getListeningStats(history, podcasts),
    [history, podcasts],
  );

  /**
   * Toggles the download on WiFi only setting
   */
  const handleToggleDownloadOnWiFi = useCallback(() => {
    updateSetting('downloadOnWiFi', !settings.downloadOnWiFi);
  }, [settings.downloadOnWiFi, updateSetting]);

  /**
   * Flips the look and saves the choice. Saving 'light' or 'dark' (never
   * 'system') means the app stops following the phone until the user taps
   * Reset All Settings, which puts the preference back to 'system'
   */
  const handleToggleDarkMode = useCallback(() => {
    updateSetting('themePreference', isDarkMode ? 'light' : 'dark');
  }, [isDarkMode, updateSetting]);

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
            toast.showToast('Settings reset to defaults');
          },
        },
      ],
    );
  }, [resetSettings, toast]);

  /**
   * Signs out after a confirmation. RootNavigator's onAuthStateChanged
   * listener updates authStore, which switches the app to the sign-in screens
   */
  const handleSignOutPress = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await AuthService.signOut();
        },
      },
    ]);
  }, []);

  return {
    downloadOnWiFi: settings.downloadOnWiFi,
    isLoading: loading,
    isDarkMode,
    account,
    listeningStats,
    toast,
    handleToggleDownloadOnWiFi,
    handleToggleDarkMode,
    handleResetSettings,
    handleSignOutPress,
  };
};

export type SettingsViewModel = ReturnType<typeof useSettingsViewModel>;
