import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../constants';
import { useThemeColors, useThemedStyles } from '../../hooks';

interface SettingLinkRowProps {
  label: string;
  onPress: () => void;
  isLast?: boolean;
}

export const SettingLinkRow = ({
  label,
  onPress,
  isLast = false,
}: SettingLinkRowProps) => {
  const colors = useThemeColors();
  const styles = useThemedStyles(createStyles);
  return (
    <TouchableOpacity
      style={[styles.container, isLast && styles.containerLast]}
      onPress={onPress}
    >
      <Text style={styles.label}>{label}</Text>
      <Ionicons name='chevron-forward' size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      minHeight: 48,
    },
    containerLast: {
      borderBottomWidth: 0,
    },
    label: {
      fontSize: 16,
      color: colors.textPrimary,
      flex: 1,
    },
  });
