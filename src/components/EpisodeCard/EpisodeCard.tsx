import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './EpisodeCard.styles';
import { COLORS } from '../../constants/Colors';
import { FormattedEpisode } from '../../screens/PodcastDetailScreen/PodcastDetail.types';
import { Podcast } from '../../models';

interface EpisodeCardProps {
  episode: FormattedEpisode;
  podcast: Podcast;
  onPress: () => void;
  onPlay: () => void;
  onAddToQueue: () => void;
}

export const EpisodeCard = ({
  episode,
  onPress,
  onPlay,
  onAddToQueue,
}: EpisodeCardProps) => (
  <TouchableOpacity
    style={[styles.episodeCard, episode.played && styles.episodeCardPlayed]}
    onPress={onPress}
  >
    <View style={styles.episodeContent}>
      <Text
        style={[
          styles.episodeTitle,
          episode.played && styles.episodeTitlePlayed,
        ]}
        numberOfLines={2}
      >
        {episode.displayTitle}
      </Text>
      <Text style={styles.episodeDescription} numberOfLines={2}>
        {episode.truncatedDescription}
      </Text>
      <View style={styles.episodeMeta}>
        <Text style={styles.episodeDate}>{episode.formattedPublishDate}</Text>
        <Text style={styles.episodeDuration}>{episode.formattedDuration}</Text>
        {episode.played && (
          <View style={styles.playedBadge}>
            <Ionicons name='checkmark' size={12} color={COLORS.textSecondary} />
            <Text style={styles.playedText}>Played</Text>
          </View>
        )}
      </View>
    </View>

    <View style={styles.episodeActions}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onPlay}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name='play-circle' size={36} color={COLORS.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onAddToQueue}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name='list' size={24} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);
