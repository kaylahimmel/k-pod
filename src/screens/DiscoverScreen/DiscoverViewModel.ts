import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { usePodcastStore } from '../../hooks';
import { DiscoveryService, RSSService } from '../../services';
import { DiscoveryPodcast, Podcast } from '../../models';
import {
  formatDiscoveryPodcasts,
  groupPodcastsByGenre,
  filterOutSubscribed,
  isSubscribed,
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
  const [hasSearched, setHasSearched] = useState(false);

  const { podcasts, addPodcast } = usePodcastStore();
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
  const hasNoTrendingResults = sections.length === 0;

  useEffect(() => {
    const fetchTrending = async () => {
      setLoadingTrending(true);
      const result = await DiscoveryService.getTrendingPodcasts('ALL', 20);
      if (result.success && result.data) {
        setTrendingPodcasts(result.data);
      }
      setLoadingTrending(false);
    };
    fetchTrending();
  }, []);

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
      console.log(
        '[DiscoverViewModel] handleSubscribe called for:',
        podcast.title,
      );
      setSubscribing(true);

      try {
        // Fetch full podcast data with episodes from RSS
        console.log('[DiscoverViewModel] Fetching RSS from:', podcast.feedUrl);
        const result = await RSSService.transformPodcastFromRSS(
          podcast.feedUrl,
        );
        console.log('[DiscoverViewModel] RSS fetch result:', result.success);
        if (result.success) {
          // Use the RSS data but preserve discovery metadata for better quality
          const podcastToAdd: Podcast = {
            ...result.data,
            id: podcast.id, // Use discovery ID for consistency
            title: podcast.title || result.data.title,
            author: podcast.author || result.data.author,
            artworkUrl: podcast.artworkUrl || result.data.artworkUrl,
            description: podcast.description || result.data.description,
          };
          console.log(
            '[DiscoverViewModel] Adding podcast to store:',
            podcastToAdd.title,
            'with',
            podcastToAdd.episodes.length,
            'episodes',
          );
          addPodcast(podcastToAdd);
          console.log('[DiscoverViewModel] Podcast added successfully');
          Alert.alert(
            'Subscribed',
            `You are now subscribed to "${podcast.title}"`,
          );
        } else {
          console.error('[DiscoverViewModel] RSS fetch failed:', result.error);
          Alert.alert(
            'Subscription Failed',
            result.error || 'Failed to subscribe to podcast',
          );
        }
      } catch (error) {
        console.error(
          '[DiscoverViewModel] Exception in handleSubscribe:',
          error,
        );
        Alert.alert('Subscription Failed', 'An unexpected error occurred');
      } finally {
        setSubscribing(false);
      }
    },
    [addPodcast],
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
    hasNoTrendingResults,
    handleSearch,
    handleSearchQueryChange,
    getOriginalPodcast,
    checkIsSubscribed,
    handlePodcastPress,
    handleSubscribe,
  };
};

export type DiscoverViewModel = ReturnType<typeof useDiscoverViewModel>;
