import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSettingsViewModel } from './SettingsViewModel';
import { SettingsViewProps } from './Settings.types';
import { createStyles } from './Settings.styles';
import {
  SettingAccountHeader,
  SettingToggleRow,
  SettingLinkRow,
  SettingStatsRow,
  SkeletonList,
  Toast,
} from '../../components';
import { useThemedStyles } from '../../hooks';

export const SettingsView = ({
  onNotificationsPress,
  onPlayerControlsPress,
  onLegalPress,
  onAppInfoPress,
  onListeningHistoryPress,
  onChangePasswordPress,
}: SettingsViewProps) => {
  const styles = useThemedStyles(createStyles);
  const viewModel = useSettingsViewModel();

  if (viewModel.isLoading) {
    return (
      <View style={styles.container}>
        <SkeletonList count={5} cardHeight={72} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* One card holds every row, in this order */}
        <View style={styles.settingsSection}>
          <SettingAccountHeader
            initials={viewModel.account.initials}
            email={viewModel.account.email}
          />
          <SettingStatsRow
            stats={[
              {
                label: 'Listening Time',
                value: viewModel.listeningStats.totalListeningTime,
              },
              {
                label: 'Episodes',
                value: viewModel.listeningStats.episodesCompleted,
              },
              {
                label: 'Subscribed',
                value: viewModel.listeningStats.podcastsSubscribed,
              },
            ]}
          />
          <SettingLinkRow
            label='Listening History'
            onPress={onListeningHistoryPress}
          />
          <SettingLinkRow
            label='Notifications'
            onPress={onNotificationsPress}
          />
          <SettingToggleRow
            label='Dark Mode'
            value={viewModel.isDarkMode}
            onValueChange={viewModel.handleToggleDarkMode}
          />
          <SettingToggleRow
            label='Download On WiFi Only'
            value={viewModel.downloadOnWiFi}
            onValueChange={viewModel.handleToggleDownloadOnWiFi}
          />
          <SettingLinkRow
            label='Player Controls'
            onPress={onPlayerControlsPress}
          />
          <SettingLinkRow label='Legal' onPress={onLegalPress} />
          <SettingLinkRow label='App Information' onPress={onAppInfoPress} />
          <SettingLinkRow
            label='Change Password'
            onPress={onChangePasswordPress}
          />
          <SettingLinkRow
            label='Sign Out'
            onPress={viewModel.handleSignOutPress}
            destructive
          />
          <SettingLinkRow
            label='Reset All Settings'
            onPress={viewModel.handleResetSettings}
            destructive
            isLast
          />
        </View>
      </ScrollView>
      <Toast
        message={viewModel.toast.message}
        visible={viewModel.toast.visible}
        translateY={viewModel.toast.translateY}
        opacity={viewModel.toast.opacity}
        onDismiss={viewModel.toast.dismissToast}
      />
    </>
  );
};
