import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FormattedPodcast } from "./LibraryPresenter";
import { useLibraryViewModel } from "./LibraryViewModel";
import { COLORS } from "../../constants/Colors";
import { LibraryViewProps } from "./Library.types";
import { SearchBar, LibraryPodcastCard } from "../../components";

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
    <Text style={styles.emptyMessage}>No podcasts found matching {query}</Text>
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

export const LibraryView = ({
  onPodcastPress,
  onAddPodcastPress,
}: LibraryViewProps) => {
  const viewModel = useLibraryViewModel(onPodcastPress, onAddPodcastPress);

  // Loading state
  if (viewModel.isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (viewModel.hasError) {
    return (
      <ErrorState
        message={viewModel.error!}
        onRetry={viewModel.handleRefresh}
      />
    );
  }

  // Empty state (no podcasts subscribed)
  if (viewModel.hasNoPodcasts) {
    return <EmptyState onAddPress={viewModel.handleAddPress} />;
  }

  // No results from search
  if (viewModel.hasNoSearchResults) {
    return (
      <View style={styles.container}>
        <SearchBar
          value={viewModel.searchQuery}
          onChangeText={viewModel.handleSearchQueryChange}
          isUsedInLibrary
        />
        <NoResultsState query={viewModel.searchQuery} />
      </View>
    );
  }

  const renderPodcastItem = ({ item }: { item: FormattedPodcast }) => (
    <LibraryPodcastCard
      podcast={item}
      onPress={() => viewModel.handlePodcastPress(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <SearchBar
        value={viewModel.searchQuery}
        onChangeText={viewModel.handleSearchQueryChange}
        isUsedInLibrary
      />
      <FlatList
        data={viewModel.displayPodcasts}
        renderItem={renderPodcastItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={viewModel.refreshing}
            onRefresh={viewModel.handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

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
