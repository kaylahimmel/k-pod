import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';
import { useThemeColors, useThemedStyles } from '../../hooks';

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
  const colors = useThemeColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.container, isLast && styles.containerLast]}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={label}
        trackColor={{ false: colors.switchTrackOff, true: colors.primary }}
        // Without an explicit thumb color, Android tints it from the system
        // theme, which put a green thumb on the blue track
        thumbColor={colors.onPrimary}
        ios_backgroundColor={colors.switchTrackOff}
        testID='setting-toggle-switch'
      />
    </View>
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
      fontSize: 18,
      color: colors.textPrimary,
      flex: 1,
    },
  });
