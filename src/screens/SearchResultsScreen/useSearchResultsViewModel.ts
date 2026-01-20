import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { usePodcastStore, useToast } from '../../hooks';
import { DiscoveryService, RSSService } from '../../services';
import { DiscoveryPodcast, Podcast } from '../../models';
import {
  formatSearchResults,
  formatResultsHeader,
  isSubscribed,
} from './SearchResultsPresenter';

/**
 * ViewModel hook for the SearchResultsScreen
 * Handles fetching search results and subscribe functionality
 */
export const useSearchResultsViewModel = (
  query: string,
  onPodcastPress: (podcast: DiscoveryPodcast) => void,
) => {
  const [results, setResults] = useState<DiscoveryPodcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { podcasts, addPodcast } = usePodcastStore();
  const toast = useToast();
  const subscribedFeedUrls = podcasts.map((p) => p.rssUrl);

  // Format results for display using presenter
  const formattedResults = formatSearchResults(results);
  const resultsHeader = formatResultsHeader(query, results.length);

  // Derived state for UI conditions
  const hasError = error !== null;
  const hasNoResults = results.length === 0 && !isLoading && !error;

  // Fetch search results when the component mounts
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const result = await DiscoveryService.searchPodcasts({
        query,
        limit: 25,
      });

      if (result.success) {
        setResults(result.data);
      } else {
        setError(result.error || 'Failed to search podcasts');
        setResults([]);
      }

      setIsLoading(false);
    };

    fetchResults();
  }, [query]);

  // Retry the search after an error
  const handleRetry = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    const result = await DiscoveryService.searchPodcasts({
      query,
      limit: 25,
    });

    if (result.success) {
      setResults(result.data);
    } else {
      setError(result.error || 'Failed to search podcasts');
      setResults([]);
    }

    setIsLoading(false);
  }, [query]);

  // Get the original podcast object from the results array
  const getOriginalPodcast = useCallback(
    (id: string): DiscoveryPodcast | undefined => {
      return results.find((p) => p.id === id);
    },
    [results],
  );

  // Check if a podcast is already subscribed
  const checkIsSubscribed = useCallback(
    (feedUrl: string): boolean => {
      return isSubscribed(feedUrl, subscribedFeedUrls);
    },
    [subscribedFeedUrls],
  );

  // Handle navigation to podcast preview
  const handlePodcastPress = useCallback(
    (podcast: DiscoveryPodcast) => {
      onPodcastPress(podcast);
    },
    [onPodcastPress],
  );

  // Subscribe to a podcast by fetching RSS and adding to store
  const handleSubscribe = useCallback(
    async (podcast: DiscoveryPodcast) => {
      try {
        const result = await RSSService.transformPodcastFromRSS(
          podcast.feedUrl,
        );

        if (result.success) {
          // Use RSS data but preserve discovery metadata for better quality
          const podcastToAdd: Podcast = {
            ...result.data,
            id: podcast.id,
            title: podcast.title || result.data.title,
            author: podcast.author || result.data.author,
            artworkUrl: podcast.artworkUrl || result.data.artworkUrl,
            description: podcast.description || result.data.description,
          };

          addPodcast(podcastToAdd);
          toast.showToast(`Subscribed to "${podcast.title}"`);
        } else {
          Alert.alert(
            'Subscription Failed',
            result.error || 'Failed to subscribe to podcast',
          );
        }
      } catch {
        Alert.alert('Subscription Failed', 'An unexpected error occurred');
      }
    },
    [addPodcast, toast],
  );

  return {
    results,
    formattedResults,
    resultsHeader,
    isLoading,
    error,
    hasError,
    hasNoResults,
    toast,
    handleRetry,
    getOriginalPodcast,
    checkIsSubscribed,
    handlePodcastPress,
    handleSubscribe,
  };
};

export type SearchResultsViewModel = ReturnType<
  typeof useSearchResultsViewModel
>;
