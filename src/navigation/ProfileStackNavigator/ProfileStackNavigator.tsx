import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types';
import { defaultScreenOptions } from '../screenOptions';
import { ProfileScreen } from '../../screens/ProfileScreen';
import { ListeningHistoryScreen } from '../../screens/ListeningHistoryScreen';
import { COLORS } from '../../constants';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

/** Placeholder Screens (to be replaced with actual Screen components)
 */
const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={placeholderStyles.container}>
    <Text style={placeholderStyles.text}>{name}</Text>
    <Text style={placeholderStyles.subtext}>Coming soon</Text>
  </View>
);

// TODO: Replace with actual screen import when implemented (Phase 8)
// import { ChangePasswordScreen } from "../../screens/ChangePasswordScreen";

const ChangePasswordScreenPlaceholder = () => (
  <PlaceholderScreen name='Change Password' />
);

const placeholderStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  subtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
});

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
        options={{ title: 'Listening History' }}
      />
      <Stack.Screen
        name='ChangePassword'
        component={ChangePasswordScreenPlaceholder}
        options={{ title: 'Change Password' }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;
