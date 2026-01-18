import { useCallback, useMemo } from "react";
import { Alert, Linking } from "react-native";
import { useSettingsStore } from "../../hooks/useSettingsStore";
import {
  formatSettings,
  getAppVersion,
  SPEED_OPTIONS,
  SKIP_FORWARD_OPTIONS,
  SKIP_BACKWARD_OPTIONS,
} from "./SettingsPresenter";
import { SettingsViewModelReturn } from "./Settings.types";

// Placeholder URLs for legal pages
const PRIVACY_POLICY_URL = "https://example.com/privacy";
const TERMS_OF_SERVICE_URL = "https://example.com/terms";

/**
 * ViewModel hook for the Settings screen
 * Manages settings state and provides handlers for user interactions
 */
export const useSettingsViewModel = (): SettingsViewModelReturn => {
  // Store access
  const { settings, loading, updateSetting, resetSettings } =
    useSettingsStore();

  // Formatted settings from presenter
  const formattedSettings = useMemo(() => formatSettings(settings), [settings]);

  // App version from presenter
  const appVersion = useMemo(() => getAppVersion(), []);

  /**
   * Toggles the auto-play next episode setting
   */
  const handleToggleAutoPlayNext = useCallback(() => {
    updateSetting("autoPlayNext", !settings.autoPlayNext);
  }, [settings.autoPlayNext, updateSetting]);

  /**
   * Updates the default playback speed
   */
  const handleSpeedChange = useCallback(
    (speed: number) => {
      updateSetting("defaultSpeed", speed);
    },
    [updateSetting],
  );

  /**
   * Toggles the download on WiFi only setting
   */
  const handleToggleDownloadOnWiFi = useCallback(() => {
    updateSetting("downloadOnWiFi", !settings.downloadOnWiFi);
  }, [settings.downloadOnWiFi, updateSetting]);

  /**
   * Updates the skip forward duration
   */
  const handleSkipForwardChange = useCallback(
    (seconds: number) => {
      updateSetting("skipForwardSeconds", seconds);
    },
    [updateSetting],
  );

  /**
   * Updates the skip backward duration
   */
  const handleSkipBackwardChange = useCallback(
    (seconds: number) => {
      updateSetting("skipBackwardSeconds", seconds);
    },
    [updateSetting],
  );

  /**
   * Resets all settings to defaults with confirmation
   */
  const handleResetSettings = useCallback(() => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all settings to their defaults?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetSettings();
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
      Alert.alert("Error", "Unable to open privacy policy.");
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
      Alert.alert("Error", "Unable to open terms of service.");
    }
  }, []);

  return {
    settings: formattedSettings,
    isLoading: loading,
    speedOptions: SPEED_OPTIONS,
    skipForwardOptions: SKIP_FORWARD_OPTIONS,
    skipBackwardOptions: SKIP_BACKWARD_OPTIONS,
    appVersion,
    handleToggleAutoPlayNext,
    handleSpeedChange,
    handleToggleDownloadOnWiFi,
    handleSkipForwardChange,
    handleSkipBackwardChange,
    handleResetSettings,
    handlePrivacyPolicyPress,
    handleTermsOfServicePress,
  };
};

export type SettingsViewModel = ReturnType<typeof useSettingsViewModel>;
