import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueueStackParamList } from '../types';
import { defaultScreenOptions } from '../screenOptions';
import { QueueScreen, EpisodeDetailScreen } from '../../screens';
import { NavigationBackButton } from '../../components';

const Stack = createNativeStackNavigator<QueueStackParamList>();

export const QueueStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen
        name='Queue'
        component={QueueScreen}
        options={{ title: 'Up Next' }}
      />
      <Stack.Screen
        name='EpisodeDetail'
        component={EpisodeDetailScreen}
        options={{
          title: 'Episode',
          headerBackVisible: false,
          headerLeft: () => <NavigationBackButton />,
        }}
      />
    </Stack.Navigator>
  );
};

export default QueueStackNavigator;
