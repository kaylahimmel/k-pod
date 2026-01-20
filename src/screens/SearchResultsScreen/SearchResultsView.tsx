import React from 'react';
import { View, Text, FlatList } from 'react-native';
import {
  SearchResultsViewProps,
  FormattedSearchResult,
} from './SearchResults.types';
import { useSearchResultsViewModel } from './useSearchResultsViewModel';
import {
  DiscoveryPodcastCard,
  StateLoading,
  StateError,
  StateNoResults,
  Toast,
} from '../../components';
import { styles } from './SearchResults.styles';

export const SearchResultsView = ({
  query,
  onPodcastPress,
}: SearchResultsViewProps) => {
  const viewModel = useSearchResultsViewModel(query, onPodcastPress);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{viewModel.resultsHeader}</Text>
    </View>
  );

  const renderPodcastCard = ({ item }: { item: FormattedSearchResult }) => {
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

  // Loading state
  if (viewModel.isLoading) {
    return (
      <>
        <View style={styles.container}>
          <StateLoading message='Searching...' />
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

  // Error state
  if (viewModel.hasError) {
    return (
      <>
        <View style={styles.container}>
          <StateError
            message={viewModel.error!}
            onRetry={viewModel.handleRetry}
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

  // No results state
  if (viewModel.hasNoResults) {
    return (
      <>
        <View style={styles.container}>
          <StateNoResults query={query} icon='sad-outline' />
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

  // Results list
  return (
    <>
      <View style={styles.container}>
        <FlatList
          data={viewModel.formattedResults}
          renderItem={renderPodcastCard}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
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
};

export default SearchResultsView;
