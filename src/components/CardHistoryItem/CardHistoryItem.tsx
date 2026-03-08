import React, { useMemo } from 'react';
import { View, Text, Image } from 'react-native';
import { FormattedHistoryItem } from '../../screens/ProfileScreen/Profile.types';
import { createStyles } from './CardHistoryItem.styles';
import { useColors } from '../../hooks';

interface CardHistoryItemProps {
  item: FormattedHistoryItem;
  isLast?: boolean;
}

export const CardHistoryItem = ({
  item,
  isLast = false,
}: CardHistoryItemProps) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
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
};
