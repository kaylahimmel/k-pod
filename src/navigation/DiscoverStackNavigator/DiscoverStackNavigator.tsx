import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DiscoverStackParamList } from '../types';
import { defaultScreenOptions } from '../screenOptions';
import { DiscoverScreen } from '../../screens/DiscoverScreen';
import { styles } from '../StackNavigator.styles';

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

/**  Placeholder Screens (to be replaced with actual Screen components)
 */
const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{name}</Text>
    <Text style={styles.placeholderSubtext}>Coming soon</Text>
  </View>
);

// TODO: Replace with actual screen imports
// import { SearchResultsScreen } from "../screens/SearchResultsScreen/SearchResultsScreen";
// import { PodcastPreviewScreen } from "../screens/PodcastPreviewScreen/PodcastPreviewScreen";

const SearchResultsScreenPlaceholder = () => (
  <PlaceholderScreen name='Search Results' />
);
const PodcastPreviewScreenPlaceholder = () => (
  <PlaceholderScreen name='Podcast Preview' />
);

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
        component={SearchResultsScreenPlaceholder}
        options={{ title: 'Search Results' }}
      />
      <Stack.Screen
        name='PodcastPreview'
        component={PodcastPreviewScreenPlaceholder}
        options={{ title: 'Podcast' }}
      />
    </Stack.Navigator>
  );
};

export default DiscoverStackNavigator;
