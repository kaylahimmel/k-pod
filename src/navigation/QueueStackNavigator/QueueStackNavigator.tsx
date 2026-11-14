import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueueStackParamList } from '../types';
import { getDefaultScreenOptions } from '../screenOptions';
import { useThemedStyles } from '../../hooks';
import { QueueScreen, EpisodeDetailScreen } from '../../screens';

const Stack = createNativeStackNavigator<QueueStackParamList>();

export const QueueStackNavigator = () => {
  const screenOptions = useThemedStyles(getDefaultScreenOptions);
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name='Queue'
        component={QueueScreen}
        options={{ title: 'Up Next' }}
      />
      <Stack.Screen
        name='EpisodeDetail'
        component={EpisodeDetailScreen}
        options={{ title: 'Episode' }}
      />
    </Stack.Navigator>
  );
};

export default QueueStackNavigator;
