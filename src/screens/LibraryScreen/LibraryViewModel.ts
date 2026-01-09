import { useState, useCallback } from "react";
import { usePodcastStore } from "../../hooks/usePodcastStore";
import { preparePodcastsForDisplay, SortOption } from "./LibraryPresenter";

export const useLibraryViewModel = (
  onPodcastPress: (podcastId: string) => void,
  onAddPodcastPress: () => void,
) => {
  // === STATE ===
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption] = useState<SortOption>("recent");
  const [refreshing, setRefreshing] = useState(false);

  // === STORE SUBSCRIPTIONS ===
  const { podcasts, loading, error } = usePodcastStore();

  // === DERIVED VALUES ===
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

  // === HANDLERS ===
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

  // === RETURN ===
  return {
    // State
    searchQuery,
    refreshing,
    loading,
    error,

    // Derived
    displayPodcasts,
    hasNoPodcasts,
    isLoading,
    hasError,
    hasNoSearchResults,

    // Handlers
    handleRefresh,
    handleSearchQueryChange,
    handlePodcastPress,
    handleAddPress,
  };
};

// =============================================================================
// Types
// =============================================================================

export type LibraryViewModel = ReturnType<typeof useLibraryViewModel>;
