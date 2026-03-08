import React, { useMemo } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { HEADER_BUTTON_CONFIG } from '../../navigation/screenOptions';
import { createStyles } from './NavigationBackButton.styles';
import { useColors } from '../../hooks';

interface NavigationBackButtonProps {
  tintColor?: string;
}

/**
 * Custom back button for navigation headers with consistent padding
 * Uses useNavigation hook to handle going back
 */
export const NavigationBackButton = ({
  tintColor = HEADER_BUTTON_CONFIG.color,
}: NavigationBackButtonProps) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const navigation = useNavigation();

  return (
    <Pressable
      onPress={() => navigation.goBack()}
      accessibilityLabel='Go back'
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Ionicons
        name='chevron-back'
        size={HEADER_BUTTON_CONFIG.iconSize}
        color={tintColor}
      />
    </Pressable>
  );
};
