import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSettingsViewModel } from "./SettingsViewModel";
import { styles } from "./Settings.styles";
import { COLORS } from "../../constants/Colors";
import {
  SettingToggleRow,
  SettingOptionSelector,
  SettingLinkRow,
} from "../../components";

export const SettingsView = () => {
  const viewModel = useSettingsViewModel();

  if (viewModel.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Playback Settings */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Playback</Text>
      </View>
      <View style={styles.settingsSection}>
        <SettingToggleRow
          label="Auto-play next episode"
          value={viewModel.settings.autoPlayNext}
          onValueChange={viewModel.handleToggleAutoPlayNext}
        />
        <SettingOptionSelector
          label="Default playback speed"
          currentValueLabel={viewModel.settings.defaultSpeedLabel}
          options={viewModel.speedOptions}
          selectedValue={viewModel.settings.defaultSpeed}
          onSelect={viewModel.handleSpeedChange}
        />
      </View>

      {/* Skip Controls */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Skip Controls</Text>
      </View>
      <View style={styles.settingsSection}>
        <SettingOptionSelector
          label="Skip forward"
          currentValueLabel={viewModel.settings.skipForwardLabel}
          options={viewModel.skipForwardOptions}
          selectedValue={viewModel.settings.skipForwardSeconds}
          onSelect={viewModel.handleSkipForwardChange}
        />
        <SettingOptionSelector
          label="Skip backward"
          currentValueLabel={viewModel.settings.skipBackwardLabel}
          options={viewModel.skipBackwardOptions}
          selectedValue={viewModel.settings.skipBackwardSeconds}
          onSelect={viewModel.handleSkipBackwardChange}
        />
      </View>

      {/* Download Settings */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Downloads</Text>
      </View>
      <View style={styles.settingsSection}>
        <SettingToggleRow
          label="Download on WiFi only"
          value={viewModel.settings.downloadOnWiFi}
          onValueChange={viewModel.handleToggleDownloadOnWiFi}
          isLast
        />
      </View>

      {/* Legal */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Legal</Text>
      </View>
      <View style={styles.settingsSection}>
        <SettingLinkRow
          label="Privacy Policy"
          onPress={viewModel.handlePrivacyPolicyPress}
        />
        <SettingLinkRow
          label="Terms of Service"
          onPress={viewModel.handleTermsOfServicePress}
          isLast
        />
      </View>

      {/* App Info */}
      <View style={styles.appInfoSection}>
        <Text style={styles.appName}>K-Pod</Text>
        <Text style={styles.appVersion}>Version {viewModel.appVersion}</Text>
      </View>

      {/* Reset Settings Button */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={viewModel.handleResetSettings}
      >
        <Text style={styles.resetButtonText}>Reset All Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
