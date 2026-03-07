import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types';
import { defaultScreenOptions } from '../screenOptions';
import { ProfileScreen } from '../../screens/ProfileScreen';
import { ListeningHistoryScreen } from '../../screens/ListeningHistoryScreen';
import { ChangePasswordScreen } from '../../screens/ChangePasswordScreen';
import { NavigationBackButton } from '../../components';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen
        name='Profile'
        component={ProfileScreen}
        options={{ title: 'Profile' }}
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

export default ProfileStackNavigator;
