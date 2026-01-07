import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePodcastStore } from "../../hooks/usePodcastStore";
import {
  preparePodcastsForDisplay,
  FormattedPodcast,
  SortOption,
} from "./LibraryPresenter";

// =============================================================================
// Types
// =============================================================================

interface LibraryViewProps {
  onPodcastPress: (podcastId: string) => void;
  onAddPodcastPress: () => void;
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
};

// =============================================================================
// Sub-Components
// =============================================================================

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

const SearchBar = ({ value, onChangeText }: SearchBarProps) => (
  <View style={styles.searchContainer}>
    <Ionicons
      name="search"
      size={18}
      color={COLORS.textSecondary}
      style={styles.searchIcon}
    />
    <TextInput
      style={styles.searchInput}
      placeholder="Search library..."
      placeholderTextColor={COLORS.textSecondary}
      value={value}
      onChangeText={onChangeText}
      autoCapitalize="none"
      autoCorrect={false}
    />
    {value.length > 0 && (
      <TouchableOpacity onPress={() => onChangeText("")}>
        <Ionicons
          name="close-circle"
          size={18}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>
    )}
  </View>
);

interface PodcastCardProps {
  podcast: FormattedPodcast;
  onPress: () => void;
}

const PodcastCard = ({ podcast, onPress }: PodcastCardProps) => (
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
      <Text style={styles.podcastMeta}>
        {podcast.episodeCountLabel} • Subscribed {podcast.formattedSubscribeDate}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
  </TouchableOpacity>
);

const EmptyState = ({ onAddPress }: { onAddPress: () => void }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="library-outline" size={64} color={COLORS.textSecondary} />
    <Text style={styles.emptyTitle}>No Podcasts Yet</Text>
    <Text style={styles.emptyMessage}>
      Add your first podcast to start listening
    </Text>
    <TouchableOpacity style={styles.emptyButton} onPress={onAddPress}>
      <Ionicons name="add" size={20} color="#FFFFFF" />
      <Text style={styles.emptyButtonText}>Add Podcast</Text>
    </TouchableOpacity>
  </View>
);

const NoResultsState = ({ query }: { query: string }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="search-outline" size={64} color={COLORS.textSecondary} />
    <Text style={styles.emptyTitle}>No Results</Text>
    <Text style={styles.emptyMessage}>
      No podcasts found matching "{query}"
    </Text>
  </View>
);

const LoadingState = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.loadingText}>Loading podcasts...</Text>
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
    <TouchableOpacity style={styles.emptyButton} onPress={onRetry}>
      <Ionicons name="refresh" size={20} color="#FFFFFF" />
      <Text style={styles.emptyButtonText}>Try Again</Text>
    </TouchableOpacity>
  </View>
);

// =============================================================================
// Main Component
// =============================================================================

export const LibraryView = ({
  onPodcastPress,
  onAddPodcastPress,
}: LibraryViewProps) => {
  const { podcasts, loading, error } = usePodcastStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption] = useState<SortOption>("recent");
  const [refreshing, setRefreshing] = useState(false);

  // Format podcasts for display using the presenter
  const displayPodcasts = preparePodcastsForDisplay(
    podcasts,
    searchQuery,
    sortOption
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: Add refresh logic when RSS service integration is complete
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderPodcastItem = useCallback(
    ({ item }: { item: FormattedPodcast }) => (
      <PodcastCard podcast={item} onPress={() => onPodcastPress(item.id)} />
    ),
    [onPodcastPress]
  );

  const keyExtractor = useCallback(
    (item: FormattedPodcast) => item.id,
    []
  );

  // Loading state
  if (loading && podcasts.length === 0) {
    return <LoadingState />;
  }

  // Error state
  if (error && podcasts.length === 0) {
    return <ErrorState message={error} onRetry={handleRefresh} />;
  }

  // Empty state (no podcasts subscribed)
  if (podcasts.length === 0) {
    return <EmptyState onAddPress={onAddPodcastPress} />;
  }

  // No results from search
  if (displayPodcasts.length === 0 && searchQuery.length > 0) {
    return (
      <View style={styles.container}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        <NoResultsState query={searchQuery} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      <FlatList
        data={displayPodcasts}
        renderItem={renderPodcastItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
    paddingBottom: 100, // Space for mini player
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
    fontSize: 12,
    color: COLORS.textSecondary,
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
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
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
});

export default LibraryView;
