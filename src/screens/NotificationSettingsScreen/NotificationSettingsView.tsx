import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNotificationSettingsViewModel } from './NotificationSettingsViewModel';
import { styles } from './NotificationSettings.styles';
import { SettingLinkRow, SettingToggleRow } from '../../components';

export const NotificationSettingsView = () => {
  const viewModel = useNotificationSettingsViewModel();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Alerts</Text>
      </View>
      <View style={styles.settingsSection}>
        <SettingToggleRow
          label='New episode alerts'
          value={viewModel.alertsEnabled}
          onValueChange={viewModel.handleToggleNotifications}
          isLast={!viewModel.isBlockedByDevice}
        />
        {viewModel.isBlockedByDevice && (
          <SettingLinkRow
            label='Open Device Settings'
            onPress={viewModel.handleOpenDeviceSettings}
            isLast
          />
        )}
      </View>
      {viewModel.isBlockedByDevice && (
        <Text style={styles.sectionHint}>
          Notifications for K-Pod are turned off in your device settings, so new
          episode alerts can&apos;t be delivered.
        </Text>
      )}

      {viewModel.alertsEnabled && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Podcasts</Text>
          </View>
          {viewModel.notificationPodcasts.length > 0 ? (
            <View style={styles.settingsSection}>
              {viewModel.notificationPodcasts.map((podcast, index) => (
                <SettingToggleRow
                  key={podcast.id}
                  label={podcast.title}
                  value={podcast.enabled}
                  onValueChange={() =>
                    viewModel.handleTogglePodcastNotifications(podcast.id)
                  }
                  isLast={index === viewModel.notificationPodcasts.length - 1}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.sectionHint}>
              Subscribe to a podcast to choose which shows send alerts.
            </Text>
          )}
        </>
      )}
    </ScrollView>
  );
};
