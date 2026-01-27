import React from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  headerButtonStyles,
  HEADER_BUTTON_CONFIG,
} from '../../navigation/screenOptions';

interface HeaderButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
  color?: string;
}

/**
 * Base header button component with consistent styling
 */
export const HeaderButton = ({
  icon,
  onPress,
  accessibilityLabel,
  style,
  iconSize = HEADER_BUTTON_CONFIG.iconSize,
  color = HEADER_BUTTON_CONFIG.color,
}: HeaderButtonProps) => (
  <Pressable
    onPress={onPress}
    accessibilityLabel={accessibilityLabel}
    style={({ pressed }) => [
      headerButtonStyles.base,
      { opacity: pressed ? 0.6 : 1 },
      style,
    ]}
  >
    <Ionicons name={icon} size={iconSize} color={color} />
  </Pressable>
);

interface HeaderBackButtonProps {
  onPress: () => void;
  accessibilityLabel?: string;
}

/**
 * Back button with chevron-back icon and extra left padding
 */
export const HeaderBackButton = ({
  onPress,
  accessibilityLabel = 'Go back',
}: HeaderBackButtonProps) => (
  <HeaderButton
    icon='chevron-back'
    onPress={onPress}
    accessibilityLabel={accessibilityLabel}
    style={headerButtonStyles.back}
  />
);

interface HeaderCloseButtonProps {
  onPress: () => void;
  accessibilityLabel?: string;
}

/**
 * Close button with X icon for dismissing modals/screens
 */
export const HeaderCloseButton = ({
  onPress,
  accessibilityLabel = 'Close',
}: HeaderCloseButtonProps) => (
  <HeaderButton
    icon='close'
    onPress={onPress}
    accessibilityLabel={accessibilityLabel}
    style={headerButtonStyles.close}
  />
);

interface HeaderActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
}

/**
 * Action button for header right (like add/settings buttons)
 */
export const HeaderActionButton = ({
  icon,
  onPress,
  accessibilityLabel,
}: HeaderActionButtonProps) => (
  <HeaderButton
    icon={icon}
    onPress={onPress}
    accessibilityLabel={accessibilityLabel}
    style={headerButtonStyles.action}
  />
);
