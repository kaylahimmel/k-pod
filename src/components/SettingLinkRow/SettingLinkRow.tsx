import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';

interface SettingLinkRowProps {
  label: string;
  onPress: () => void;
  isLast?: boolean;
}

export const SettingLinkRow = ({
  label,
  onPress,
  isLast = false,
}: SettingLinkRowProps) => (
  <TouchableOpacity
    style={[styles.container, isLast && styles.containerLast]}
    onPress={onPress}
  >
    <Text style={styles.label}>{label}</Text>
    <Ionicons name='chevron-forward' size={20} color={COLORS.textSecondary} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    minHeight: 48,
  },
  containerLast: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 16,
    color: COLORS.textPrimary,
    flex: 1,
  },
});
