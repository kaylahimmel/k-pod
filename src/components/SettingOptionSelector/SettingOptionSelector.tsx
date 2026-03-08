import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColors } from '../../hooks';
import { createStyles } from './SettingOptionSelector.styles';

interface Option<T extends number | string> {
  value: T;
  label: string;
}

interface SettingOptionSelectorProps<T extends number | string> {
  label: string;
  currentValueLabel: string;
  options: Option<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
}

export const SettingOptionSelector = <T extends number | string>({
  label,
  currentValueLabel,
  options,
  selectedValue,
  onSelect,
}: SettingOptionSelectorProps<T>) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.currentValue}>{currentValueLabel}</Text>
      </View>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={String(option.value)}
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
