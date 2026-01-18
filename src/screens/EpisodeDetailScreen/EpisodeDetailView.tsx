import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EpisodeDetailViewProps } from './EpisodeDetail.types';
import { useEpisodeDetailViewModel } from './EpisodeDetailViewModel';
import { styles } from './EpisodeDetail.styles';
import { StateLoading, EpisodeNotFoundState } from '../../components';
import { COLORS } from '../../constants';

export const EpisodeDetailView = (props: EpisodeDetailViewProps) => {
  const viewModel = useEpisodeDetailViewModel(
    props.episodeId,
    props.podcastId,
    props.onPlayEpisode,
    props.onGoBack,
  );

  // Loading state
  if (viewModel.loading && !viewModel.podcast) {
    return <StateLoading message='Loading episode...' />;
  }

  // Episode not found
  if (!viewModel.formattedEpisode) {
    return <EpisodeNotFoundState />;
  }

  const { formattedEpisode, isInQueue, handlePlay, handleAddToQueue } =
    viewModel;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with artwork and episode info */}
      <View style={styles.header}>
        <Image
          source={{ uri: formattedEpisode.podcastArtworkUrl }}
          style={styles.artwork}
          resizeMode='cover'
        />
        <Text style={styles.podcastTitle} numberOfLines={1}>
          {formattedEpisode.podcastTitle}
        </Text>
        <Text style={styles.episodeTitle}>{formattedEpisode.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {formattedEpisode.formattedPublishDate}
          </Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>
            {formattedEpisode.formattedDurationLong}
          </Text>
          {formattedEpisode.played && (
            <>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.playedBadge}>Played</Text>
            </>
          )}
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handlePlay}
          activeOpacity={0.7}
        >
          <Ionicons name='play' size={20} color={COLORS.cardBackground} />
          <Text style={styles.actionButtonText}>Play</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={handleAddToQueue}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isInQueue ? 'checkmark' : 'add'}
            size={20}
            color={COLORS.textPrimary}
          />
          <Text
            style={[styles.actionButtonText, styles.actionButtonTextSecondary]}
          >
            {isInQueue ? 'In Queue' : 'Add to Queue'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Episode description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionLabel}>Episode Notes</Text>
        <Text style={styles.descriptionText}>
          {formattedEpisode.description || 'No description available.'}
        </Text>
      </View>
    </ScrollView>
  );
};

export default EpisodeDetailView;
