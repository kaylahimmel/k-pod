import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';
import { useThemedStyles } from '../../hooks';

interface Option<T extends number> {
  value: T;
  label: string;
}

interface SettingOptionSelectorProps<T extends number> {
  label: string;
  currentValueLabel: string;
  options: Option<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
}

/**
 * Generic option picker shared by the playback-speed and skip-interval settings.
 *
 * The generic parameter keeps each call site's value type intact: the speed
 * picker stays bound to the PlaybackSpeed literal union (so it can't be handed
 * an arbitrary number), while the skip pickers keep using plain numbers. A
 * non-generic `value: number` would silently widen the speed picker and let
 * invalid speeds through.
 */
export const SettingOptionSelector = <T extends number>({
  label,
  currentValueLabel,
  options,
  selectedValue,
  onSelect,
}: SettingOptionSelectorProps<T>) => {
  const styles = useThemedStyles(createStyles);
  return (
    <View>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.currentValue}>{currentValueLabel}</Text>
      </View>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              selectedValue === option.value && styles.optionButtonSelected,
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text
              style={[
                styles.optionButtonText,
                selectedValue === option.value &&
                  styles.optionButtonTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      minHeight: 48,
    },
    label: {
      fontSize: 16,
      color: colors.textPrimary,
      flex: 1,
    },
    currentValue: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    optionButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionButtonText: {
      fontSize: 14,
      color: colors.textPrimary,
    },
    optionButtonTextSelected: {
      color: colors.onPrimary,
      fontWeight: '600',
    },
  });
