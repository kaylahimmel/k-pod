import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './CardDiscoverPodcast.styles';
import { COLORS } from '../../constants/Colors';
import { FormattedDiscoveryPodcast } from '../../screens/DiscoverScreen/Discover.types';

interface DiscoveryPodcastCardProps {
  podcast: FormattedDiscoveryPodcast;
  isSubscribed: boolean;
  onPress: () => void;
  onSubscribe: () => void;
}

export const DiscoveryPodcastCard = ({
  podcast,
  isSubscribed: subscribed,
  onPress,
  onSubscribe,
}: DiscoveryPodcastCardProps) => (
  <TouchableOpacity style={styles.podcastCard} onPress={onPress}>
    <Image
      source={{ uri: podcast.artworkUrl }}
      style={styles.podcastArtwork}
      defaultSource={require('../../../assets/icon.png')}
    />
    <View style={styles.podcastInfo}>
      <Text style={styles.podcastTitle} numberOfLines={2}>
        {podcast.displayTitle}
      </Text>
      <Text style={styles.podcastAuthor} numberOfLines={1}>
        {podcast.author}
      </Text>
      <View style={styles.podcastMeta}>
        <Text style={styles.podcastGenre}>{podcast.genre}</Text>
        <Text style={styles.podcastEpisodes}>{podcast.episodeCountLabel}</Text>
      </View>
    </View>
    <TouchableOpacity
      style={[styles.subscribeButton, subscribed && styles.subscribedButton]}
      onPress={onSubscribe}
      disabled={subscribed}
    >
      {subscribed ? (
        <Ionicons name='checkmark' size={16} color={COLORS.success} />
      ) : (
        <Ionicons name='add' size={16} color={COLORS.primary} />
      )}
    </TouchableOpacity>
  </TouchableOpacity>
);
