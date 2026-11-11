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
import { NavigationBackButton } from '../../components';

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
        options={{
          title: 'Notifications',
          headerBackVisible: false,
          headerLeft: () => <NavigationBackButton />,
        }}
      />
      <Stack.Screen
        name='PlayerControls'
        component={PlayerControlsScreen}
        options={{
          title: 'Player Controls',
          headerBackVisible: false,
          headerLeft: () => <NavigationBackButton />,
        }}
      />
      <Stack.Screen
        name='Legal'
        component={LegalScreen}
        options={{
          title: 'Legal',
          headerBackVisible: false,
          headerLeft: () => <NavigationBackButton />,
        }}
      />
      <Stack.Screen
        name='AppInfo'
        component={AppInfoScreen}
        options={{
          title: 'App Information',
          headerBackVisible: false,
          headerLeft: () => <NavigationBackButton />,
        }}
      />
      <Stack.Screen
        name='ListeningHistory'
        component={ListeningHistoryScreen}
        options={{
          title: 'Listening History',
          headerBackVisible: false,
          headerLeft: () => <NavigationBackButton />,
        }}
      />
      <Stack.Screen
        name='ChangePassword'
        component={ChangePasswordScreen}
        options={{
          title: 'Change Password',
          headerBackVisible: false,
          headerLeft: () => <NavigationBackButton />,
        }}
      />
    </Stack.Navigator>
  );
};

export default SettingsStackNavigator;
