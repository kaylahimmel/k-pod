import { FormattedHistoryItem } from '../../models';
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../../constants';
import { styles } from './CardHistoryItem.styles';

interface CardHistoryItemProps {
  item: FormattedHistoryItem;
  isLast?: boolean;
  /** When provided, renders a 3-dot button that opens an actions menu */
  onMenuPress?: () => void;
}

export const CardHistoryItem = ({
  item,
  isLast = false,
  onMenuPress,
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
    {onMenuPress && (
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onMenuPress}
        accessibilityRole='button'
        accessibilityLabel={`Actions for ${item.episodeTitle}`}
      >
        <Ionicons
          name='ellipsis-horizontal'
          size={20}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>
    )}
  </View>
);
