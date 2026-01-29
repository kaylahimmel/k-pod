import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DiscoverStackParamList } from '../types';
import { defaultScreenOptions } from '../screenOptions';
import { DiscoverScreen } from '../../screens/DiscoverScreen';
import { SearchResultsScreen } from '../../screens/SearchResultsScreen';
import { PodcastPreviewScreen } from '../../screens/PodcastPreviewScreen';
import { EpisodeDetailScreen } from '../../screens/EpisodeDetailScreen';
import { NavigationBackButton } from '../../components';

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export const DiscoverStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen
        name='Discover'
        component={DiscoverScreen}
        options={{ title: 'Discover' }}
      />
      <Stack.Screen
        name='SearchResults'
        component={SearchResultsScreen}
        options={{
          title: 'Search Results',
          headerBackVisible: false,
          headerLeft: () => <NavigationBackButton />,
        }}
      />
      <Stack.Screen
        name='PodcastPreview'
        component={PodcastPreviewScreen}
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
    </Stack.Navigator>
  );
};

export default DiscoverStackNavigator;
