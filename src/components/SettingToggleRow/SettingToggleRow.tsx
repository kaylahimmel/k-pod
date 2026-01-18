import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

interface SettingToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: () => void;
  isLast?: boolean;
}

export const SettingToggleRow = ({
  label,
  value,
  onValueChange,
  isLast = false,
}: SettingToggleRowProps) => (
  <View style={[styles.container, isLast && styles.containerLast]}>
    <Text style={styles.label}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: COLORS.border, true: COLORS.primary }}
    />
  </View>
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
