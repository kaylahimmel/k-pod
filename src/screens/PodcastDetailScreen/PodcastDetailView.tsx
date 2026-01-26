import React from 'react';
import {
  FlatList,
  RefreshControl,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import {
  FormattedEpisode,
  PodcastDetailViewProps,
} from './PodcastDetail.types';
import { usePodcastDetailViewModel } from './PodcastDetailViewModel';
import { styles } from './PodcastDetail.styles';
import { COLORS } from '../../constants';
import {
  CardEpisode,
  HeaderPodcast,
  EpisodesEmpty,
  EpisodeLoadingState,
  EpisodeNotFoundState,
  Toast,
} from '../../components';

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
      <CardEpisode
        podcast={viewModel.podcast}
        episode={item}
        onPress={() => viewModel.onEpisodePress(item.id)}
        onPlay={() => viewModel.handleEpisodePlayEpisode(rawEpisode)}
        onAddToQueue={() => viewModel.handleEpisodeAddToQueue(rawEpisode)}
        isInQueue={viewModel.isEpisodeInQueue(item.id)}
      />
    );
  };

  const renderFooter = () => {
    const totalEpisodes = viewModel.formattedPodcast?.episodes.length || 0;
    const showingLimited = !viewModel.showAllEpisodes && totalEpisodes > 5;

    if (!showingLimited && totalEpisodes <= 5) return null;

    return (
      <View style={styles.footerButtons}>
        {showingLimited && (
          <TouchableOpacity
            style={styles.footerButton}
            onPress={viewModel.toggleShowAllEpisodes}
          >
            <Text style={styles.footerButtonText}>See more</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.footerButton, styles.archivedButton]}
          onPress={() => {
            // TODO: Navigate to archived episodes
          }}
        >
          <Text style={styles.footerButtonText}>Archived</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const episodesToShow = viewModel.showAllEpisodes
    ? viewModel.formattedPodcast.episodes
    : viewModel.formattedPodcast.episodes.slice(0, 5);

  return (
    <>
      <FlatList
        style={styles.container}
        data={episodesToShow}
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
        ListFooterComponent={renderFooter}
        ListEmptyComponent={<EpisodesEmpty />}
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

export default PodcastDetailView;
