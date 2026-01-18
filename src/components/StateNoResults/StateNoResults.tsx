import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { styles } from './StateNoResults.styles';

interface StateNoResultsProps {
  query: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const StateNoResults = ({
  query,
  icon = 'search-outline',
}: StateNoResultsProps) => (
  <View style={styles.container}>
    <Ionicons name={icon} size={64} color={COLORS.textSecondary} />
    <Text style={styles.title}>No Results</Text>
    <Text style={styles.message}>No podcasts found matching {query}</Text>
  </View>
);
