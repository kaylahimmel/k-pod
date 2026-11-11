import React, { useCallback } from 'react';
import { SettingsScreenProps } from '../../navigation/types';
import { SettingsView } from './SettingsView';

export const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
  // Navigation handlers: each opens a screen in the Settings stack
  const handleNotificationsPress = useCallback(() => {
    navigation.navigate('NotificationSettings');
  }, [navigation]);

  const handlePlayerControlsPress = useCallback(() => {
    navigation.navigate('PlayerControls');
  }, [navigation]);

  const handleLegalPress = useCallback(() => {
    navigation.navigate('Legal');
  }, [navigation]);

  const handleAppInfoPress = useCallback(() => {
    navigation.navigate('AppInfo');
  }, [navigation]);

  const handleListeningHistoryPress = useCallback(() => {
    navigation.navigate('ListeningHistory');
  }, [navigation]);

  const handleChangePasswordPress = useCallback(() => {
    navigation.navigate('ChangePassword');
  }, [navigation]);

  return (
    <SettingsView
      onNotificationsPress={handleNotificationsPress}
      onPlayerControlsPress={handlePlayerControlsPress}
      onLegalPress={handleLegalPress}
      onAppInfoPress={handleAppInfoPress}
      onListeningHistoryPress={handleListeningHistoryPress}
      onChangePasswordPress={handleChangePasswordPress}
    />
  );
};
