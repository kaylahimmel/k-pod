import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FormattedPodcast } from "./LibraryPresenter";
import { useLibraryViewModel } from "./LibraryViewModel";
import { COLORS } from "../../constants/Colors";
import { LibraryViewProps } from "./Library.types";
import { SearchBar, LibraryPodcastCard } from "../../components";
import { styles } from "./Library.styles";

const EmptyState = ({ onAddPress }: { onAddPress: () => void }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="library-outline" size={64} color={COLORS.textSecondary} />
    <Text style={styles.emptyTitle}>No Podcasts Yet</Text>
    <Text style={styles.emptyMessage}>
      Add your first podcast to start listening
    </Text>
    <TouchableOpacity style={styles.emptyButton} onPress={onAddPress}>
      <Ionicons name="add" size={20} color={COLORS.cardBackground} />
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
    <Ionicons name="alert-circle-outline" size={64} color={COLORS.danger} />
    <Text style={styles.emptyTitle}>Something went wrong</Text>
    <Text style={styles.emptyMessage}>{message}</Text>
    <TouchableOpacity style={styles.emptyButton} onPress={onRetry}>
      <Ionicons name="refresh" size={20} color={COLORS.cardBackground} />
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

export default LibraryView;
