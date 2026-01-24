import React, { useCallback, useLayoutEffect } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LibraryScreenProps } from '../../navigation/types';
import { LibraryView } from './LibraryView';
import { COLORS } from '../../constants';

export const LibraryScreen = ({ navigation }: LibraryScreenProps) => {
  // Navigation handler: Navigate to podcast detail
  const handlePodcastPressNav = useCallback(
    (podcastId: string) => {
      navigation.navigate('PodcastDetail', { podcastId });
    },
    [navigation],
  );

  // Navigation handler: Open add podcast modal
  const handleAddPodcastPressNav = useCallback(() => {
    navigation.navigate('AddPodcastModal');
  }, [navigation]);

  // Configure header right button for adding podcasts
  // paddingLeft compensates for iOS native header button container offset on physical devices
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={handleAddPodcastPressNav}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
            paddingLeft: 4,
            paddingTop: 1,
          })}
        >
          <Ionicons
            name='add-circle-outline'
            size={28}
            color={COLORS.primary}
          />
        </Pressable>
      ),
    });
  }, [navigation, handleAddPodcastPressNav]);

  return (
    <LibraryView
      onPodcastPress={handlePodcastPressNav}
      onAddPodcastPress={handleAddPodcastPressNav}
    />
  );
};

export default LibraryScreen;
