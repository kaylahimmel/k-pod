import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  headerButtonStyles,
  HEADER_BUTTON_HIT_SLOP,
  HEADER_ICON_SIZE,
} from '../../navigation/screenOptions';
import { useThemeColors } from '../../hooks';

interface NavigationBackButtonProps {
  tintColor?: string;
}

/**
 * Custom back button for navigation headers with consistent padding
 * Uses useNavigation hook to handle going back
 */
export const NavigationBackButton = ({
  tintColor,
}: NavigationBackButtonProps) => {
  const navigation = useNavigation();
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={() => navigation.goBack()}
      accessibilityLabel='Go back'
      hitSlop={HEADER_BUTTON_HIT_SLOP}
      style={({ pressed }) => [
        headerButtonStyles.base,
        { opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Ionicons
        name='chevron-back'
        size={HEADER_ICON_SIZE}
        color={tintColor ?? colors.primary}
      />
    </Pressable>
  );
};
