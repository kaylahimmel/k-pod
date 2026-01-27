import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { styles } from './CardLibraryPodcast.styles';

export interface CardLibraryPodcastProps {
  artworkUrl: string;
  title: string;
  subtitle: string;
  meta?: string;
  onPress: () => void;
  onLongPress?: () => void;
  showChevron?: boolean;
}

export const CardLibraryPodcast = ({
  artworkUrl,
  title,
  subtitle,
  meta,
  onPress,
  onLongPress,
  showChevron = true,
}: CardLibraryPodcastProps) => (
  <TouchableOpacity
    style={styles.podcastCard}
    onPress={onPress}
    onLongPress={onLongPress}
  >
    <Image
      source={{ uri: artworkUrl }}
      style={styles.podcastArtwork}
      defaultSource={require('../../../assets/icon.png')}
    />
    <View style={styles.podcastInfo}>
      <Text style={styles.podcastTitle} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.podcastAuthor} numberOfLines={1}>
        {subtitle}
      </Text>
      {meta && <Text style={styles.podcastMeta}>{meta}</Text>}
    </View>
    {showChevron && (
      <Ionicons name='chevron-forward' size={20} color={COLORS.textSecondary} />
    )}
  </TouchableOpacity>
);
