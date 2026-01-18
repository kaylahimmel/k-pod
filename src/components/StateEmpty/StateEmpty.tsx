import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/Colors';
import { styles } from './StateEmpty.styles';

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
}: StateEmptyProps) => (
  <View style={styles.container}>
    <Ionicons name={icon} size={64} color={COLORS.textSecondary} />
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    {buttonText && onButtonPress && (
      <TouchableOpacity style={styles.button} onPress={onButtonPress}>
        {buttonIcon && (
          <Ionicons name={buttonIcon} size={20} color={COLORS.cardBackground} />
        )}
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    )}
  </View>
);
