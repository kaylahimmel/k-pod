import { useState, useCallback, useEffect } from "react";
import { usePodcastStore } from "../../hooks/usePodcastStore";
import { DiscoveryService } from "../../services/DiscoveryService";
import { DiscoveryPodcast, Podcast } from "../../models";
import { now } from "../../constants/NowDate";
import {
  formatDiscoveryPodcasts,
  groupPodcastsByGenre,
  filterOutSubscribed,
  isSubscribed,
} from "./DiscoverPresenter";

export const useDiscoverViewModel = (
  onPodcastPress: (podcast: DiscoveryPodcast) => void,
  onSubscribe: (podcast: DiscoveryPodcast) => void,
) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DiscoveryPodcast[]>([]);
  const [trendingPodcasts, setTrendingPodcasts] = useState<DiscoveryPodcast[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const { podcasts } = usePodcastStore();
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
      const result = await DiscoveryService.getTrendingPodcasts("ALL", 20);
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
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
  }, []);

  const handleSearchQueryChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      if (text === "") {
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

  /**
   * Converts a DiscoveryPodcast to a Podcast for subscription
   */
  function createPodcastFromDiscovery(discovery: DiscoveryPodcast): Podcast {
    return {
      id: discovery.id,
      title: discovery.title,
      author: discovery.author,
      rssUrl: discovery.feedUrl,
      artworkUrl: discovery.artworkUrl,
      description: discovery.description || "",
      subscribeDate: now,
      lastUpdated: now,
      episodes: [], // Episodes will be fetched from RSS
    };
  }

  const handlePodcastPress = useCallback(
    (podcast: DiscoveryPodcast) => {
      onPodcastPress(podcast);
    },
    [onPodcastPress],
  );

  const handleSubscribe = useCallback(
    (podcast: DiscoveryPodcast) => {
      onSubscribe(podcast);
    },
    [onSubscribe],
  );

  return {
    searchQuery,
    loading,
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
    createPodcastFromDiscovery,
    handlePodcastPress,
    handleSubscribe,
  };
};

export type DiscoverViewModel = ReturnType<typeof useDiscoverViewModel>;
