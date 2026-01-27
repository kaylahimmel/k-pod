import React, { useCallback, useLayoutEffect } from 'react';
import { LibraryScreenProps } from '../../navigation/types';
import { LibraryView } from './LibraryView';
import { HeaderActionButton } from '../../components';

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
        <HeaderActionButton
          icon='add-circle-outline'
          onPress={handleAddPodcastPressNav}
          accessibilityLabel='Add podcast'
        />
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
