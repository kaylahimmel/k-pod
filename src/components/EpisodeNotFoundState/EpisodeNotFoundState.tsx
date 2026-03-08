import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles } from './EpisodeNotFoundState.styles';
import { useColors } from '../../hooks';

export const EpisodeNotFoundState = () => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.emptyContainer}>
      <Ionicons name='alert-circle-outline' size={64} color={colors.danger} />
      <Text style={styles.emptyTitle}>Podcast Not Found</Text>
      <Text style={styles.emptyMessage}>
        This podcast may have been removed from your library
      </Text>
    </View>
  );
};
