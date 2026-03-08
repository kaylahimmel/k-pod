import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles } from './StateNoResults.styles';
import { useColors } from '../../hooks';

interface StateNoResultsProps {
  query: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const StateNoResults = ({
  query,
  icon = 'search-outline',
}: StateNoResultsProps) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.textSecondary} />
      <Text style={styles.title}>No Results</Text>
      <Text style={styles.message}>No podcasts found matching {query}</Text>
    </View>
  );
};
