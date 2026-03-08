import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createStyles } from './EpisodeLoadingState.styles';
import { useColors } from '../../hooks';

export const EpisodeLoadingState = () => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size='large' color={colors.primary} />
      <Text style={styles.loadingText}>Loading podcast...</Text>
    </View>
  );
};
