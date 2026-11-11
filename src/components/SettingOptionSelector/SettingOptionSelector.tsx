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
  options: Option<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  isLast?: boolean;
}

/**
 * Generic option picker shared by the playback-speed and skip-interval settings.
 *
 * The generic parameter keeps each call site's value type intact: the speed
 * picker stays bound to the PlaybackSpeed literal union (so it can't be handed
 * an arbitrary number), while the skip pickers keep using plain numbers. A
 * non-generic `value: number` would silently widen the speed picker and let
 * invalid speeds through.
 *
 * The title and its buttons are one setting, so the bottom border sits under
 * the buttons rather than between them. There's no current-value label: the
 * highlighted button already shows the choice.
 */
export const SettingOptionSelector = <T extends number>({
  label,
  options,
  selectedValue,
  onSelect,
  isLast = false,
}: SettingOptionSelectorProps<T>) => {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.container, isLast && styles.containerLast]}>
      <Text style={styles.label}>{label}</Text>
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
    container: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    containerLast: {
      borderBottomWidth: 0,
    },
    // 16 above the title and below the buttons matches where a toggle row's
    // label sits: SettingToggleRow pads 12, and the taller switch centers its
    // text about 4 more points in
    label: {
      fontSize: 18,
      color: colors.textPrimary,
      paddingTop: 16,
      paddingHorizontal: 16,
    },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
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
      backgroundColor: colors.primaryFill,
      borderColor: colors.primaryFill,
    },
    optionButtonText: {
      fontSize: 17,
      color: colors.textPrimary,
    },
    optionButtonTextSelected: {
      color: colors.onPrimary,
      fontWeight: '600',
    },
  });
