import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LibraryStackParamList } from '../types';
import { defaultScreenOptions } from '../screenOptions';
import {
  LibraryScreen,
  PodcastDetailScreen,
  EpisodeDetailScreen,
  DiscoverScreen,
} from '../../screens';
import { NavigationBackButton } from '../../components';

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
        options={{
          title: 'Podcast',
          headerBackVisible: false,
          headerLeft: () => <NavigationBackButton />,
        }}
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
      <Stack.Screen
        name='Discover'
        component={DiscoverScreen}
        options={{ title: 'Discover' }}
      />
    </Stack.Navigator>
  );
};

export default LibraryStackNavigator;
