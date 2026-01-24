import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { modalScreenOptions } from './screenOptions';
import { styles } from './RootNavigator.styles';
import { FullPlayerScreen } from '../screens';

const Stack = createNativeStackNavigator<RootStackParamList>();

const PlaceholderModal = ({ title }: { title: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{title}</Text>
    <Text style={styles.placeholderSubtext}>Coming soon</Text>
  </View>
);

// TODO: Replace with actual modal screen import
// import { AddPodcastModal } from "../screens/AddPodcastModal";

const AddPodcastModalPlaceholder = () => (
  <PlaceholderModal title='Add Podcast' />
);

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
          component={AddPodcastModalPlaceholder}
          options={{ title: 'Add Podcast' }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default RootNavigator;
