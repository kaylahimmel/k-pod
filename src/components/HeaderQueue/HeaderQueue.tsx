import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles } from './HeaderQueue.styles';
import { useThemeColors, useThemedStyles } from '../../hooks';

interface HeaderQueueProps {
  count: string;
  remainingTime: string;
  onClear: () => void;
  hasItems: boolean;
}

export const HeaderQueue = ({
  count,
  remainingTime,
  onClear,
  hasItems,
}: HeaderQueueProps) => {
  const colors = useThemeColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        <View style={styles.headerStats}>
          <Text style={styles.headerTitle}>{count}</Text>
          <Text style={styles.headerSubtitle}>{remainingTime}</Text>
        </View>
        {hasItems && (
          <TouchableOpacity style={styles.clearButton} onPress={onClear}>
            <Ionicons name='trash-outline' size={16} color={colors.danger} />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
