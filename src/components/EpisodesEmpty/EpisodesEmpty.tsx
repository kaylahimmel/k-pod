import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { styles } from './EpisodesEmpty.styles';

export const EpisodesEmpty = () => (
  <View style={styles.emptyContainer}>
    <Ionicons name='mic-off-outline' size={48} color={COLORS.textSecondary} />
    <Text style={styles.emptyTitle}>No Episodes</Text>
    <Text style={styles.emptyMessage}>
      This podcast does not have any episodes yet
    </Text>
  </View>
);
