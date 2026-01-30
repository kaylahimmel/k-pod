import { useState, useCallback } from 'react';
import { usePodcastStore, useToast } from '../../hooks';
import { RSSService } from '../../services/RSSService';
import { preparePodcastsForDisplay } from './LibraryPresenter';
import { SortOption } from './Library.types';

export const useLibraryViewModel = (
  onPodcastPress: (podcastId: string) => void,
  onAddPodcastPress: () => void,
) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption] = useState<SortOption>('recent');
  const [refreshing, setRefreshing] = useState(false);
  const { podcasts, loading, error, updatePodcastEpisodes } = usePodcastStore();
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

  // Refreshes all subscribed podcasts by fetching latest episodes from RSS feeds
  const handleRefresh = useCallback(async () => {
    if (podcasts.length === 0) return;

    setRefreshing(true);
    let successCount = 0;
    let newEpisodeCount = 0;

    // Refresh all podcasts in parallel
    const refreshPromises = podcasts.map(async (podcast) => {
      const result = await RSSService.refreshEpisodes(
        podcast.id,
        podcast.rssUrl,
      );
      if (result.success && result.data) {
        const existingIds = new Set(podcast.episodes.map((ep) => ep.id));
        const newEpisodes = result.data.filter((ep) => !existingIds.has(ep.id));
        newEpisodeCount += newEpisodes.length;
        updatePodcastEpisodes(podcast.id, result.data);
        successCount++;
      }
    });

    await Promise.all(refreshPromises);
    setRefreshing(false);

    // Show feedback to user
    if (newEpisodeCount > 0) {
      toast.showToast(
        `Found ${newEpisodeCount} new episode${newEpisodeCount === 1 ? '' : 's'}`,
      );
    } else if (successCount === podcasts.length) {
      toast.showToast('All podcasts up to date');
    }
  }, [podcasts, updatePodcastEpisodes, toast]);

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
