import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LibraryStackParamList } from '../types';
import { getDefaultScreenOptions } from '../screenOptions';
import { useThemedStyles } from '../../hooks';
import {
  LibraryScreen,
  PodcastDetailScreen,
  EpisodeDetailScreen,
  DiscoverScreen,
  CompletedEpisodesScreen,
} from '../../screens';

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export const LibraryStackNavigator = () => {
  const screenOptions = useThemedStyles(getDefaultScreenOptions);
  return (
    <Stack.Navigator screenOptions={screenOptions}>
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
      <Stack.Screen
        name='CompletedEpisodes'
        component={CompletedEpisodesScreen}
        options={{ title: 'Completed' }}
      />
      <Stack.Screen
        name='Discover'
        component={DiscoverScreen}
        options={{ title: 'Discover' }}
      />
    </Stack.Navigator>
  );
};

export default LibraryStackNavigator;
