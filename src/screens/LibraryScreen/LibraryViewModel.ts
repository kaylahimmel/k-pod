import { useState, useCallback } from 'react';
import { usePodcastStore, useToast } from '../../hooks';
import { RefreshService } from '../../services/RefreshService';
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
  const toast = useToast();
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

  // Refreshes all subscribed podcasts via RefreshService.
  // The service owns the fetch/diff/store-update sequence and is the only
  // path that resets lastRefreshTime, so pull-to-refresh here also restarts
  // the foreground-refresh throttle instead of leaving it stale.
  const handleRefresh = useCallback(async () => {
    if (podcasts.length === 0) return;

    setRefreshing(true);
    const result = await RefreshService.refreshAllPodcasts();
    setRefreshing(false);

    if (result.totalNewEpisodes > 0) {
      toast.showToast(
        `Found ${result.totalNewEpisodes} new episode${result.totalNewEpisodes === 1 ? '' : 's'}`,
      );
    } else if (result.successCount === result.totalPodcasts) {
      toast.showToast('All podcasts up to date');
    }
  }, [podcasts.length, toast]);

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
