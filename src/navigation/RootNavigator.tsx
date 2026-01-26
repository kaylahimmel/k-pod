import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { modalScreenOptions } from './screenOptions';
import { FullPlayerScreen, AddPodcastModal } from '../screens';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Main' component={TabNavigator} />
      <Stack.Group screenOptions={modalScreenOptions}>
        <Stack.Screen
          name='FullPlayer'
          component={FullPlayerScreen}
          options={{ title: 'Now Playing' }}
        />
        <Stack.Screen
          name='AddPodcastModal'
          component={AddPodcastModal}
          options={{ title: 'Add Podcast' }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default RootNavigator;
