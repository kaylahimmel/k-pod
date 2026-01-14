import React from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { useLibraryViewModel } from "./LibraryViewModel";
import { COLORS } from "../../constants/Colors";
import { LibraryViewProps, FormattedPodcast } from "./Library.types";
import {
  SearchBar,
  LibraryPodcastCard,
  StateEmpty,
  StateLoading,
  StateError,
  StateNoResults,
} from "../../components";
import { styles } from "./Library.styles";

export const LibraryView = ({
  onPodcastPress,
  onAddPodcastPress,
}: LibraryViewProps) => {
  const viewModel = useLibraryViewModel(onPodcastPress, onAddPodcastPress);

  // Loading state
  if (viewModel.isLoading) {
    return <StateLoading message="Loading podcasts..." />;
  }

  // Error state
  if (viewModel.hasError) {
    return (
      <StateError
        message={viewModel.error!}
        onRetry={viewModel.handleRefresh}
      />
    );
  }

  // Empty state (no podcasts subscribed)
  if (viewModel.hasNoPodcasts) {
    return (
      <StateEmpty
        icon="library-outline"
        title="No Podcasts Yet"
        message="Add your first podcast to start listening"
        buttonText="Add Podcast"
        buttonIcon="add"
        onButtonPress={viewModel.handleAddPress}
      />
    );
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
        <StateNoResults query={viewModel.searchQuery} />
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
