import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SectionList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { DiscoveryPodcast } from "../../models";
import { FormattedDiscoveryPodcast } from "./DiscoverPresenter";
import { useDiscoverViewModel } from "./DiscoverViewModel";
import { COLORS } from "../../constants/Colors";
import { DiscoveryPodcastCard, SearchBar } from "../../components";
import { styles } from "./Discover.styles";

interface DiscoverViewProps {
  onPodcastPress: (podcast: DiscoveryPodcast) => void;
  onSubscribe: (podcast: DiscoveryPodcast) => void;
}

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
    <Ionicons name="alert-circle-outline" size={64} color={COLORS.danger} />
    <Text style={styles.emptyTitle}>Something went wrong</Text>
    <Text style={styles.emptyMessage}>{message}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Ionicons name="refresh" size={20} color={COLORS.cardBackground} />
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
  const viewModel = useDiscoverViewModel(onPodcastPress, onSubscribe);

  const renderPodcastCard = ({ item }: { item: FormattedDiscoveryPodcast }) => {
    const originalPodcast = viewModel.getOriginalPodcast(item.id);
    const subscribed = viewModel.checkIsSubscribed(item.feedUrl);

    return (
      <DiscoveryPodcastCard
        podcast={item}
        isSubscribed={subscribed}
        onPress={() =>
          originalPodcast && viewModel.handlePodcastPress(originalPodcast)
        }
        onSubscribe={() =>
          originalPodcast && viewModel.handleSubscribe(originalPodcast)
        }
      />
    );
  };

  // Loading state for initial trending fetch
  if (viewModel.isLoadingTrending) {
    return (
      <View style={styles.container}>
        <SearchBar
          value={viewModel.searchQuery}
          onChangeText={viewModel.handleSearchQueryChange}
          onSubmit={viewModel.handleSearch}
        />
        <LoadingState />
      </View>
    );
  }

  // Search mode
  if (viewModel.hasSearched) {
    if (viewModel.isSearching) {
      return (
        <View style={styles.container}>
          <SearchBar
            value={viewModel.searchQuery}
            onChangeText={viewModel.handleSearchQueryChange}
            onSubmit={viewModel.handleSearch}
          />
          <LoadingState />
        </View>
      );
    }

    if (viewModel.hasSearchError) {
      return (
        <View style={styles.container}>
          <SearchBar
            value={viewModel.searchQuery}
            onChangeText={viewModel.handleSearchQueryChange}
            onSubmit={viewModel.handleSearch}
          />
          <ErrorState
            message={viewModel.error!}
            onRetry={viewModel.handleSearch}
          />
        </View>
      );
    }

    if (viewModel.hasNoSearchResults) {
      return (
        <View style={styles.container}>
          <SearchBar
            value={viewModel.searchQuery}
            onChangeText={viewModel.handleSearchQueryChange}
            onSubmit={viewModel.handleSearch}
          />
          <NoResultsState query={viewModel.searchQuery} />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <SearchBar
          value={viewModel.searchQuery}
          onChangeText={viewModel.handleSearchQueryChange}
          onSubmit={viewModel.handleSearch}
        />
        <SectionHeader title={`Results for "${viewModel.searchQuery}"`} />
        <FlatList
          data={viewModel.formattedSearchResults}
          renderItem={renderPodcastCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  // Trending mode
  return (
    <View style={styles.container}>
      <SearchBar
        value={viewModel.searchQuery}
        onChangeText={viewModel.handleSearchQueryChange}
        onSubmit={viewModel.handleSearch}
      />
      {viewModel.hasNoTrendingResults ? (
        <EmptySearchState />
      ) : (
        <SectionList
          sections={viewModel.sections}
          renderItem={renderPodcastCard}
          renderSectionHeader={({ section }) => (
            <SectionHeader title={section.title} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
};

export default DiscoverView;
