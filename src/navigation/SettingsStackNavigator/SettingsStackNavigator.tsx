import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../types';
import { getDefaultScreenOptions } from '../screenOptions';
import { useThemedStyles } from '../../hooks';
import { SettingsScreen } from '../../screens';

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
    </Stack.Navigator>
  );
};

export default SettingsStackNavigator;
