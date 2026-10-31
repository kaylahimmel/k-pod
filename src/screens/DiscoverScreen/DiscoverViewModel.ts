import { isSubscribed } from '../../utils';
import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { usePodcastStore, useToast } from '../../hooks';
import { DiscoveryService, RSSService } from '../../services';
import { DiscoveryPodcast, Podcast } from '../../models';
import {
  formatDiscoveryPodcasts,
  groupPodcastsByGenre,
  filterOutSubscribed,
} from './DiscoverPresenter';

export const useDiscoverViewModel = (
  onPodcastPress: (podcast: DiscoveryPodcast) => void,
) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DiscoveryPodcast[]>([]);
  const [trendingPodcasts, setTrendingPodcasts] = useState<DiscoveryPodcast[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trendingError, setTrendingError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { podcasts, addPodcast } = usePodcastStore();
  const toast = useToast();
  const subscribedFeedUrls = podcasts.map((p) => p.rssUrl);

  const filteredTrending = filterOutSubscribed(
    trendingPodcasts,
    subscribedFeedUrls,
  );
  const groupedPodcasts = groupPodcastsByGenre(filteredTrending);
  const sections = groupedPodcasts.map((group) => ({
    title: group.genre,
    data: group.podcasts,
  }));

  const formattedSearchResults = formatDiscoveryPodcasts(searchResults);

  const isLoadingTrending = loadingTrending && !hasSearched;
  const isSearching = hasSearched && loading;
  const hasSearchError = hasSearched && error !== null;
  const hasNoSearchResults =
    hasSearched && searchResults.length === 0 && !loading && !error;
  // A failed refresh keeps the list already on screen
  const hasTrendingError =
    trendingError !== null && trendingPodcasts.length === 0;
  const hasNoTrendingResults = sections.length === 0;

  // Returns the error message so a refresh can decide how to show it
  const fetchTrending = useCallback(async (): Promise<string | null> => {
    const result = await DiscoveryService.getTrendingPodcasts('ALL', 20);
    if (result.success) {
      setTrendingPodcasts(result.data);
      setTrendingError(null);
      return null;
    }
    setTrendingError(result.error);
    return result.error;
  }, []);

  useEffect(() => {
    const loadInitialTrending = async () => {
      await fetchTrending();
      setLoadingTrending(false);
    };
    loadInitialTrending();
  }, [fetchTrending]);

  const handleRetryTrending = useCallback(async () => {
    setLoadingTrending(true);
    await fetchTrending();
    setLoadingTrending(false);
  }, [fetchTrending]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    const refreshError = await fetchTrending();
    setIsRefreshing(false);

    if (refreshError && trendingPodcasts.length > 0) {
      Alert.alert('Refresh Failed', refreshError);
    }
  }, [fetchTrending, trendingPodcasts.length]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    const result = await DiscoveryService.searchPodcasts({
      query: searchQuery,
    });

    if (result.success) {
      setSearchResults(result.data);
    } else {
      setError(result.error);
      setSearchResults([]);
    }

    setLoading(false);
  }, [searchQuery]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
  }, []);

  const handleSearchQueryChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      if (text === '') {
        handleClearSearch();
      }
    },
    [handleClearSearch],
  );

  const getOriginalPodcast = useCallback(
    (id: string): DiscoveryPodcast | undefined => {
      return [...searchResults, ...trendingPodcasts].find((p) => p.id === id);
    },
    [searchResults, trendingPodcasts],
  );

  const checkIsSubscribed = useCallback(
    (feedUrl: string): boolean => {
      return isSubscribed(feedUrl, subscribedFeedUrls);
    },
    [subscribedFeedUrls],
  );

  const handlePodcastPress = useCallback(
    (podcast: DiscoveryPodcast) => {
      onPodcastPress(podcast);
    },
    [onPodcastPress],
  );

  // Subscribe directly by adding podcast to the store
  // Fetches episodes from RSS feed
  const handleSubscribe = useCallback(
    async (podcast: DiscoveryPodcast) => {
      setSubscribing(true);

      try {
        const result = await RSSService.createPodcastFromDiscovery(podcast);
        if (result.success) {
          addPodcast(result.data);
          toast.showToast(`Subscribed to "${podcast.title}"`);
        } else {
          Alert.alert(
            'Subscription Failed',
            result.error || 'Failed to subscribe to podcast',
          );
        }
      } catch (error) {
        Alert.alert(
          'Subscription Failed',
          `An unexpected error occurred: ${error}`,
        );
      } finally {
        setSubscribing(false);
      }
    },
    [addPodcast, toast],
  );

  return {
    searchQuery,
    loading,
    subscribing,
    error,
    hasSearched,
    sections,
    formattedSearchResults,
    isLoadingTrending,
    isSearching,
    hasSearchError,
    hasNoSearchResults,
    hasTrendingError,
    hasNoTrendingResults,
    isRefreshing,
    trendingError,
    toast,
    handleSearch,
    handleSearchQueryChange,
    handleRefresh,
    handleRetryTrending,
    getOriginalPodcast,
    checkIsSubscribed,
    handlePodcastPress,
    handleSubscribe,
  };
};

export type DiscoverViewModel = ReturnType<typeof useDiscoverViewModel>;
