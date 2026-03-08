import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles } from './EpisodesEmpty.styles';
import { useColors } from '../../hooks';

export const EpisodesEmpty = () => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.emptyContainer}>
      <Ionicons name='mic-off-outline' size={48} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Episodes</Text>
      <Text style={styles.emptyMessage}>
        This podcast does not have any episodes yet
      </Text>
    </View>
  );
};
