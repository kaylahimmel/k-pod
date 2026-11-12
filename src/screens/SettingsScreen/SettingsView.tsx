import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSettingsViewModel } from './SettingsViewModel';
import { SettingsViewProps } from './Settings.types';
import { createStyles } from '../../styles/settingsPage.styles';
import {
  SettingAccountHeader,
  SettingToggleRow,
  SettingLinkRow,
  SettingStatsRow,
  Toast,
} from '../../components';
import { useThemedStyles } from '../../hooks';

export const SettingsView = ({ onNavigate }: SettingsViewProps) => {
  const styles = useThemedStyles(createStyles);
  const viewModel = useSettingsViewModel();

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
          <SettingStatsRow stats={viewModel.listeningStats} />
          <SettingLinkRow
            label='Listening History'
            onPress={() => onNavigate('ListeningHistory')}
          />
          <SettingLinkRow
            label='Notifications'
            onPress={() => onNavigate('NotificationSettings')}
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
            onPress={() => onNavigate('PlayerControls')}
          />
          <SettingLinkRow label='Legal' onPress={() => onNavigate('Legal')} />
          <SettingLinkRow
            label='App Information'
            onPress={() => onNavigate('AppInfo')}
          />
          <SettingLinkRow
            label='Change Password'
            onPress={() => onNavigate('ChangePassword')}
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
