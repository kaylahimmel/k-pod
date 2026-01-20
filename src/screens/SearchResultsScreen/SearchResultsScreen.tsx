import React, { useCallback } from 'react';
import { SearchResultsScreenProps } from '../../navigation/types';
import { SearchResultsView } from './SearchResultsView';
import { DiscoveryPodcast } from '../../models';

export const SearchResultsScreen = ({
  navigation,
  route,
}: SearchResultsScreenProps) => {
  const { query } = route.params;

  // Navigate to podcast preview when a podcast is pressed
  const handlePodcastPress = useCallback(
    (podcast: DiscoveryPodcast) => {
      navigation.navigate('PodcastPreview', { podcast });
    },
    [navigation],
  );

  return (
    <SearchResultsView query={query} onPodcastPress={handlePodcastPress} />
  );
};

export default SearchResultsScreen;
