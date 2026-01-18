import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

interface Option {
  value: number;
  label: string;
}

interface SettingOptionSelectorProps {
  label: string;
  currentValueLabel: string;
  options: Option[];
  selectedValue: number;
  onSelect: (value: number) => void;
}

export const SettingOptionSelector = ({
  label,
  currentValueLabel,
  options,
  selectedValue,
  onSelect,
}: SettingOptionSelectorProps) => (
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
              selectedValue === option.value && styles.optionButtonTextSelected,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    minHeight: 48,
  },
  label: {
    fontSize: 16,
    color: COLORS.textPrimary,
    flex: 1,
  },
  currentValue: {
    fontSize: 16,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionButtonText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  optionButtonTextSelected: {
    color: COLORS.cardBackground,
    fontWeight: '600',
  },
});
