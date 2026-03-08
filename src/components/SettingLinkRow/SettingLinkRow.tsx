import React, { useMemo } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { createStyles } from './SettingLinkRow.styles';

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
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
