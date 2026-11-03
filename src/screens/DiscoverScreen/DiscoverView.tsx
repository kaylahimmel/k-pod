import React from 'react';
import {
  View,
  Text,
  FlatList,
  SectionList,
  RefreshControl,
} from 'react-native';
import { DiscoveryPodcast } from '../../models';
import { FormattedDiscoveryPodcast } from './Discover.types';
import { useDiscoverViewModel } from './DiscoverViewModel';
import {
  DiscoveryPodcastCard,
  SearchBar,
  StateEmpty,
  SkeletonList,
  StateError,
  StateNoResults,
  Toast,
} from '../../components';
import { COLORS } from '../../constants';
import { styles } from './Discover.styles';

interface DiscoverViewProps {
  onPodcastPress: (podcast: DiscoveryPodcast) => void;
}

interface SectionHeaderProps {
  title: string;
}

const SectionHeader = ({ title }: SectionHeaderProps) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

export const DiscoverView = ({ onPodcastPress }: DiscoverViewProps) => {
  const viewModel = useDiscoverViewModel(onPodcastPress);

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
      <>
        <View style={styles.container}>
          <SearchBar
            value={viewModel.searchQuery}
            onChangeText={viewModel.handleSearchQueryChange}
            onSubmit={viewModel.handleSearch}
          />
          <SkeletonList count={6} cardHeight={88} />
        </View>
        <Toast
          message={viewModel.toast.message}
          visible={viewModel.toast.visible}
          translateY={viewModel.toast.translateY}
          opacity={viewModel.toast.opacity}
          onDismiss={viewModel.toast.dismissToast}
        />
      </>
    );
  }

  // Search mode
  if (viewModel.hasSearched) {
    if (viewModel.isSearching) {
      return (
        <>
          <View style={styles.container}>
            <SearchBar
              value={viewModel.searchQuery}
              onChangeText={viewModel.handleSearchQueryChange}
              onSubmit={viewModel.handleSearch}
            />
            <SkeletonList count={6} cardHeight={88} />
          </View>
          <Toast
            message={viewModel.toast.message}
            visible={viewModel.toast.visible}
            translateY={viewModel.toast.translateY}
            opacity={viewModel.toast.opacity}
            onDismiss={viewModel.toast.dismissToast}
          />
        </>
      );
    }

    if (viewModel.hasSearchError) {
      return (
        <>
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
          <Toast
            message={viewModel.toast.message}
            visible={viewModel.toast.visible}
            translateY={viewModel.toast.translateY}
            opacity={viewModel.toast.opacity}
            onDismiss={viewModel.toast.dismissToast}
          />
        </>
      );
    }

    if (viewModel.hasNoSearchResults) {
      return (
        <>
          <View style={styles.container}>
            <SearchBar
              value={viewModel.searchQuery}
              onChangeText={viewModel.handleSearchQueryChange}
              onSubmit={viewModel.handleSearch}
            />
            <StateNoResults query={viewModel.searchQuery} icon='sad-outline' />
          </View>
          <Toast
            message={viewModel.toast.message}
            visible={viewModel.toast.visible}
            translateY={viewModel.toast.translateY}
            opacity={viewModel.toast.opacity}
            onDismiss={viewModel.toast.dismissToast}
          />
        </>
      );
    }

    return (
      <>
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
        <Toast
          message={viewModel.toast.message}
          visible={viewModel.toast.visible}
          translateY={viewModel.toast.translateY}
          opacity={viewModel.toast.opacity}
          onDismiss={viewModel.toast.dismissToast}
        />
      </>
    );
  }

  // Trending mode
  return (
    <>
      <View style={styles.container}>
        <SearchBar
          value={viewModel.searchQuery}
          onChangeText={viewModel.handleSearchQueryChange}
          onSubmit={viewModel.handleSearch}
        />
        {viewModel.hasTrendingError ? (
          <StateError
            message={viewModel.trendingError!}
            onRetry={viewModel.handleRetryTrending}
          />
        ) : viewModel.hasNoTrendingResults ? (
          <StateEmpty
            icon='search-outline'
            title='Discover Podcasts'
            message='Search for your favorite podcasts'
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
            testID='discover-list'
            refreshControl={
              <RefreshControl
                refreshing={viewModel.isRefreshing}
                onRefresh={viewModel.handleRefresh}
                tintColor={COLORS.primary}
              />
            }
          />
        )}
      </View>
      <Toast
        message={viewModel.toast.message}
        visible={viewModel.toast.visible}
        translateY={viewModel.toast.translateY}
        opacity={viewModel.toast.opacity}
        onDismiss={viewModel.toast.dismissToast}
      />
    </>
  );
};

export default DiscoverView;
