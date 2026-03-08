import React, { useMemo } from 'react';
import { View, Text, Switch } from 'react-native';
import { useColors } from '../../hooks';
import { createStyles } from './SettingToggleRow.styles';

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
}: SettingToggleRowProps) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.container, isLast && styles.containerLast]}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        testID='setting-toggle-switch'
      />
    </View>
  );
};
