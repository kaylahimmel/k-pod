import React from 'react';
import { View, Text, Image } from 'react-native';
import { FormattedHistoryItem } from '../../screens/ProfileScreen/Profile.types';
import { styles } from './CardHistoryItem.styles';

interface CardHistoryItemProps {
  item: FormattedHistoryItem;
  isLast?: boolean;
}

export const CardHistoryItem = ({
  item,
  isLast = false,
}: CardHistoryItemProps) => (
  <View style={[styles.container, isLast && styles.containerLast]}>
    <Image source={{ uri: item.podcastArtworkUrl }} style={styles.artwork} />
    <View style={styles.info}>
      <Text style={styles.episodeTitle} numberOfLines={1}>
        {item.displayTitle}
      </Text>
      <Text style={styles.podcastTitle} numberOfLines={1}>
        {item.podcastTitle}
      </Text>
      <Text style={styles.meta}>
        {item.formattedCompletedAt} · {item.formattedCompletionPercentage}
      </Text>
    </View>
  </View>
);
