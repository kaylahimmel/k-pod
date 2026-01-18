import { useState, useCallback } from 'react';
import { usePodcastStore } from '../../hooks/usePodcastStore';
import { preparePodcastsForDisplay } from './LibraryPresenter';
import { SortOption } from './Library.types';

export const useLibraryViewModel = (
  onPodcastPress: (podcastId: string) => void,
  onAddPodcastPress: () => void,
) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption] = useState<SortOption>('recent');
  const [refreshing, setRefreshing] = useState(false);
  const { podcasts, loading, error } = usePodcastStore();
  const displayPodcasts = preparePodcastsForDisplay(
    podcasts,
    searchQuery,
    sortOption,
  );
  const hasNoPodcasts = podcasts.length === 0;
  const isLoading = loading && hasNoPodcasts;
  const hasError = error && hasNoPodcasts;
  const hasNoSearchResults =
    displayPodcasts.length === 0 && searchQuery.length > 0;

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: Add refresh logic when RSS service integration is complete
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleSearchQueryChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handlePodcastPress = useCallback(
    (podcastId: string) => {
      onPodcastPress(podcastId);
    },
    [onPodcastPress],
  );

  const handleAddPress = useCallback(() => {
    onAddPodcastPress();
  }, [onAddPodcastPress]);

  return {
    searchQuery,
    refreshing,
    loading,
    error,
    displayPodcasts,
    hasNoPodcasts,
    isLoading,
    hasError,
    hasNoSearchResults,
    handleRefresh,
    handleSearchQueryChange,
    handlePodcastPress,
    handleAddPress,
  };
};

export type LibraryViewModel = ReturnType<typeof useLibraryViewModel>;
