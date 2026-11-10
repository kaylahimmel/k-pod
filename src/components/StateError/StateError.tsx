import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles } from './StateError.styles';
import { useThemeColors, useThemedStyles } from '../../hooks';

interface StateErrorProps {
  message: string;
  onRetry: () => void;
}

export const StateError = ({ message, onRetry }: StateErrorProps) => {
  const colors = useThemeColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container}>
      <Ionicons name='alert-circle-outline' size={64} color={colors.danger} />
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.button} onPress={onRetry}>
        <Ionicons name='refresh' size={20} color={colors.onPrimary} />
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};
