import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DiscoverStackParamList } from '../types';
import { defaultScreenOptions } from '../screenOptions';
import { DiscoverScreen } from '../../screens/DiscoverScreen';
import { SearchResultsScreen } from '../../screens/SearchResultsScreen';
import { PodcastPreviewScreen } from '../../screens/PodcastPreviewScreen/PodcastPreviewScreen';
import { styles } from '../StackNavigator.styles';

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
        options={{ title: 'Search Results' }}
      />
      <Stack.Screen
        name='PodcastPreview'
        component={PodcastPreviewScreen}
        options={{ title: 'Podcast' }}
      />
    </Stack.Navigator>
  );
};

export default DiscoverStackNavigator;
