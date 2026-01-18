import React from "react";
import { View, Text, FlatList, SectionList } from "react-native";
import { DiscoveryPodcast } from "../../models";
import { FormattedDiscoveryPodcast } from "./Discover.types";
import { useDiscoverViewModel } from "./DiscoverViewModel";
import {
  DiscoveryPodcastCard,
  SearchBar,
  StateEmpty,
  StateLoading,
  StateError,
  StateNoResults,
} from "../../components";
import { styles } from "./Discover.styles";

interface DiscoverViewProps {
  onPodcastPress: (podcast: DiscoveryPodcast) => void;
  onSubscribe: (podcast: DiscoveryPodcast) => void;
}

interface SectionHeaderProps {
  title: string;
}

const SectionHeader = ({ title }: SectionHeaderProps) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

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
        <StateLoading message="Searching..." />
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
          <StateLoading message="Searching..." />
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
          <StateError
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
          <StateNoResults query={viewModel.searchQuery} icon="sad-outline" />
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
        <StateEmpty
          icon="search-outline"
          title="Discover Podcasts"
          message="Search for your favorite podcasts or browse trending shows below"
        />
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
