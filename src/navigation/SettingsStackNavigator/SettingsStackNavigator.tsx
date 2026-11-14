import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../types';
import { getDefaultScreenOptions } from '../screenOptions';
import { useThemedStyles } from '../../hooks';
import {
  SettingsScreen,
  NotificationSettingsScreen,
  PlayerControlsScreen,
  LegalScreen,
  AppInfoScreen,
  ListeningHistoryScreen,
  ChangePasswordScreen,
} from '../../screens';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export const SettingsStackNavigator = () => {
  const screenOptions = useThemedStyles(getDefaultScreenOptions);
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name='Settings'
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name='NotificationSettings'
        component={NotificationSettingsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen
        name='PlayerControls'
        component={PlayerControlsScreen}
        options={{ title: 'Player Controls' }}
      />
      <Stack.Screen
        name='Legal'
        component={LegalScreen}
        options={{ title: 'Legal' }}
      />
      <Stack.Screen
        name='AppInfo'
        component={AppInfoScreen}
        options={{ title: 'App Information' }}
      />
      <Stack.Screen
        name='ListeningHistory'
        component={ListeningHistoryScreen}
        options={{ title: 'Listening History' }}
      />
      <Stack.Screen
        name='ChangePassword'
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />
    </Stack.Navigator>
  );
};

export default SettingsStackNavigator;
