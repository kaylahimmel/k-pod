import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  SectionList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePodcastStore } from "../../hooks/usePodcastStore";
import { DiscoveryService } from "../../services/DiscoveryService";
import type { DiscoveryPodcast } from "../../models";
import {
  formatDiscoveryPodcasts,
  groupPodcastsByGenre,
  filterOutSubscribed,
  isSubscribed,
  FormattedDiscoveryPodcast,
} from "./DiscoverPresenter";

// =============================================================================
// Types
// =============================================================================
interface DiscoverViewProps {
  onPodcastPress: (podcast: DiscoveryPodcast) => void;
  onSubscribe: (podcast: DiscoveryPodcast) => void;
}

// =============================================================================
// Constants
// =============================================================================
const COLORS = {
  primary: "#007AFF",
  background: "#F2F2F7",
  cardBackground: "#FFFFFF",
  textPrimary: "#1C1C1E",
  textSecondary: "#8E8E93",
  border: "#E5E5EA",
  searchBackground: "#E5E5EA",
  success: "#34C759",
};

// =============================================================================
// Sub-Components
// =============================================================================
interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
}

const SearchBar = ({ value, onChangeText, onSubmit }: SearchBarProps) => (
  <View style={styles.searchContainer}>
    <Ionicons
      name="search"
      size={18}
      color={COLORS.textSecondary}
      style={styles.searchIcon}
    />
    <TextInput
      style={styles.searchInput}
      placeholder="Search podcasts..."
      placeholderTextColor={COLORS.textSecondary}
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmit}
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="search"
    />
    {value.length > 0 && (
      <TouchableOpacity onPress={() => onChangeText("")}>
        <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
      </TouchableOpacity>
    )}
  </View>
);

interface DiscoveryPodcastCardProps {
  podcast: FormattedDiscoveryPodcast;
  isSubscribed: boolean;
  onPress: () => void;
  onSubscribe: () => void;
}

const DiscoveryPodcastCard = ({
  podcast,
  isSubscribed: subscribed,
  onPress,
  onSubscribe,
}: DiscoveryPodcastCardProps) => (
  <TouchableOpacity style={styles.podcastCard} onPress={onPress}>
    <Image
      source={{ uri: podcast.artworkUrl }}
      style={styles.podcastArtwork}
      defaultSource={require("../../../assets/icon.png")}
    />
    <View style={styles.podcastInfo}>
      <Text style={styles.podcastTitle} numberOfLines={2}>
        {podcast.displayTitle}
      </Text>
      <Text style={styles.podcastAuthor} numberOfLines={1}>
        {podcast.author}
      </Text>
      <View style={styles.podcastMeta}>
        <Text style={styles.podcastGenre}>{podcast.genre}</Text>
        <Text style={styles.podcastEpisodes}>{podcast.episodeCountLabel}</Text>
      </View>
    </View>
    <TouchableOpacity
      style={[styles.subscribeButton, subscribed && styles.subscribedButton]}
      onPress={onSubscribe}
      disabled={subscribed}
    >
      {subscribed ? (
        <Ionicons name="checkmark" size={16} color={COLORS.success} />
      ) : (
        <Ionicons name="add" size={16} color={COLORS.primary} />
      )}
    </TouchableOpacity>
  </TouchableOpacity>
);

const LoadingState = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.loadingText}>Searching...</Text>
  </View>
);

const ErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
    <Text style={styles.emptyTitle}>Something went wrong</Text>
    <Text style={styles.emptyMessage}>{message}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Ionicons name="refresh" size={20} color="#FFFFFF" />
      <Text style={styles.retryButtonText}>Try Again</Text>
    </TouchableOpacity>
  </View>
);

const EmptySearchState = () => (
  <View style={styles.emptyContainer}>
    <Ionicons name="search-outline" size={64} color={COLORS.textSecondary} />
    <Text style={styles.emptyTitle}>Discover Podcasts</Text>
    <Text style={styles.emptyMessage}>
      Search for your favorite podcasts or browse trending shows below
    </Text>
  </View>
);

const NoResultsState = ({ query }: { query: string }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="sad-outline" size={64} color={COLORS.textSecondary} />
    <Text style={styles.emptyTitle}>No Results</Text>
    <Text style={styles.emptyMessage}>No podcasts found for {query}</Text>
  </View>
);

interface SectionHeaderProps {
  title: string;
}

const SectionHeader = ({ title }: SectionHeaderProps) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// =============================================================================
// Main Component
// =============================================================================
export const DiscoverView = ({
  onPodcastPress,
  onSubscribe,
}: DiscoverViewProps) => {
  const { podcasts } = usePodcastStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DiscoveryPodcast[]>([]);
  const [trendingPodcasts, setTrendingPodcasts] = useState<DiscoveryPodcast[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Get subscribed feed URLs for comparison
  const subscribedFeedUrls = podcasts.map((p) => p.rssUrl);

  // Fetch trending podcasts on mount
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

  const renderPodcastCard = useCallback(
    ({ item }: { item: FormattedDiscoveryPodcast }) => {
      const originalPodcast = [...searchResults, ...trendingPodcasts].find(
        (p) => p.id === item.id,
      );
      const subscribed = isSubscribed(item.feedUrl, subscribedFeedUrls);

      return (
        <DiscoveryPodcastCard
          podcast={item}
          isSubscribed={subscribed}
          onPress={() => originalPodcast && onPodcastPress(originalPodcast)}
          onSubscribe={() => originalPodcast && onSubscribe(originalPodcast)}
        />
      );
    },
    [
      searchResults,
      trendingPodcasts,
      subscribedFeedUrls,
      onPodcastPress,
      onSubscribe,
    ],
  );

  const keyExtractor = useCallback(
    (item: FormattedDiscoveryPodcast) => item.id,
    [],
  );

  // Show loading state for initial trending fetch
  if (loadingTrending && !hasSearched) {
    return (
      <View style={styles.container}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchQueryChange}
          onSubmit={handleSearch}
        />
        <LoadingState />
      </View>
    );
  }

  // Show search results if user has searched
  if (hasSearched) {
    if (loading) {
      return (
        <View style={styles.container}>
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearchQueryChange}
            onSubmit={handleSearch}
          />
          <LoadingState />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.container}>
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearchQueryChange}
            onSubmit={handleSearch}
          />
          <ErrorState message={error} onRetry={handleSearch} />
        </View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <View style={styles.container}>
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearchQueryChange}
            onSubmit={handleSearch}
          />
          <NoResultsState query={searchQuery} />
        </View>
      );
    }

    const formattedResults = formatDiscoveryPodcasts(searchResults);

    return (
      <View style={styles.container}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchQueryChange}
          onSubmit={handleSearch}
        />
        <SectionHeader title={`Results for "${searchQuery}"`} />
        <FlatList
          data={formattedResults}
          renderItem={renderPodcastCard}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  // Show trending podcasts grouped by genre
  const filteredTrending = filterOutSubscribed(
    trendingPodcasts,
    subscribedFeedUrls,
  );
  const groupedPodcasts = groupPodcastsByGenre(filteredTrending);

  // Convert to SectionList data format
  const sections = groupedPodcasts.map((group) => ({
    title: group.genre,
    data: group.podcasts,
  }));

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearchQueryChange}
        onSubmit={handleSearch}
      />
      {sections.length === 0 ? (
        <EmptySearchState />
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderPodcastCard}
          renderSectionHeader={({ section }) => (
            <SectionHeader title={section.title} />
          )}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
};

// =============================================================================
// Styles
// =============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.searchBackground,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  podcastCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  podcastArtwork: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  podcastInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  podcastTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  podcastAuthor: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  podcastMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  podcastGenre: {
    fontSize: 12,
    color: COLORS.primary,
    marginRight: 8,
  },
  podcastEpisodes: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  subscribeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  subscribedButton: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.success,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: COLORS.background,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
});

export default DiscoverView;
