import React, { useCallback } from 'react';
import { SettingsScreenProps } from '../../navigation/types';
import { SettingsView } from './SettingsView';

export const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
  // Navigation handler: Open the notifications modal
  const handleNotificationsPress = useCallback(() => {
    navigation.navigate('NotificationSettings');
  }, [navigation]);

  return <SettingsView onNotificationsPress={handleNotificationsPress} />;
};
