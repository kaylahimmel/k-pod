import React, { useCallback, useLayoutEffect } from 'react';
import { TouchableOpacity } from 'react-native';
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
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleAddPodcastPressNav}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name='add-circle-outline'
            size={28}
            color={COLORS.primary}
          />
        </TouchableOpacity>
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
