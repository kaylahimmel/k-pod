import React from "react";
import { FlatList, RefreshControl } from "react-native";
import {
  FormattedEpisode,
  PodcastDetailViewProps,
} from "./PodcastDetail.types";
import { usePodcastDetailViewModel } from "./PodcastDetailViewModel";
import { styles } from "./PodcastDetail.styles";
import { COLORS } from "../../constants/Colors";
import {
  EpisodeCard,
  HeaderPodcast,
  EmptyEpisodes,
  EpisodeLoadingState,
  EpisodeNotFoundState,
} from "../../components";

export const PodcastDetailView = (props: PodcastDetailViewProps) => {
  const viewModel = usePodcastDetailViewModel(
    props.podcastId,
    props.onEpisodePress,
    props.onPlayEpisode,
    props.onUnsubscribe,
  );

  // Loading state
  if (viewModel.loading && !viewModel.podcast) {
    return <EpisodeLoadingState />;
  }

  // Podcast not found
  if (!viewModel.formattedPodcast) {
    return <EpisodeNotFoundState />;
  }

  const renderEpisode = ({ item }: { item: FormattedEpisode }) => {
    const rawEpisode = viewModel.getEpisodeRawData(item.id);
    if (!rawEpisode || !viewModel.podcast) return null;

    return (
      <EpisodeCard
        podcast={viewModel.podcast}
        episode={item}
        onPress={() => viewModel.onEpisodePress(item.id)}
        onPlay={() => viewModel.handleEpisodePlayEpisode(rawEpisode)}
        onAddToQueue={() => viewModel.handleEpisodeAddToQueue(rawEpisode)}
      />
    );
  };

  return (
    <FlatList
      style={styles.container}
      data={viewModel.formattedPodcast.episodes}
      renderItem={renderEpisode}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <HeaderPodcast
          podcast={viewModel.formattedPodcast}
          onUnsubscribe={viewModel.handleEpisodeUnsubscribe}
          showFullDescription={viewModel.showFullDescription}
          onToggleDescription={viewModel.toggleEpisodeDescription}
        />
      }
      ListEmptyComponent={<EmptyEpisodes />}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={viewModel.refreshing}
          onRefresh={viewModel.handleEpisodeRefresh}
          tintColor={COLORS.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

export default PodcastDetailView;
