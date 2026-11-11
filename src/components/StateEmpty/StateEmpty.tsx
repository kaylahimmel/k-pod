import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles } from './StateEmpty.styles';
import { useThemeColors, useThemedStyles } from '../../hooks';

interface StateEmptyProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  buttonText?: string;
  buttonIcon?: keyof typeof Ionicons.glyphMap;
  onButtonPress?: () => void;
}

export const StateEmpty = ({
  icon,
  title,
  message,
  buttonText,
  buttonIcon,
  onButtonPress,
}: StateEmptyProps) => {
  const colors = useThemeColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.textSecondary} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {buttonText && onButtonPress && (
        <TouchableOpacity style={styles.button} onPress={onButtonPress}>
          {buttonIcon && (
            <Ionicons name={buttonIcon} size={20} color={colors.onPrimary} />
          )}
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
