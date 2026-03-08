import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createStyles } from './StateLoading.styles';
import { useColors } from '../../hooks';

interface StateLoadingProps {
  message?: string;
}

export const StateLoading = ({ message = 'Loading...' }: StateLoadingProps) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size='large' color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};
