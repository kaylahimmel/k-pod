import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LibraryStackParamList } from '../types';
import { defaultScreenOptions } from '../screenOptions';
import {
  LibraryScreen,
  PodcastDetailScreen,
  EpisodeDetailScreen,
} from '../../screens';

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export const LibraryStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen
        name='Library'
        component={LibraryScreen}
        options={{ title: 'Library' }}
      />
      <Stack.Screen
        name='PodcastDetail'
        component={PodcastDetailScreen}
        options={{ title: 'Podcast' }}
      />
      <Stack.Screen
        name='EpisodeDetail'
        component={EpisodeDetailScreen}
        options={{ title: 'Episode' }}
      />
    </Stack.Navigator>
  );
};

export default LibraryStackNavigator;
