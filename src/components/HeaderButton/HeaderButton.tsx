import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  headerButtonStyles,
  HEADER_BUTTON_HIT_SLOP,
  HEADER_ICON_SIZE,
} from './HeaderButton.styles';
import { useThemeColors } from '../../hooks';

interface HeaderButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
}

/**
 * The one header button every header icon uses (back, close, add), so size,
 * tap area and press feedback are set in a single place
 */
export const HeaderButton = ({
  icon,
  onPress,
  accessibilityLabel,
}: HeaderButtonProps) => {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      hitSlop={HEADER_BUTTON_HIT_SLOP}
      style={({ pressed }) => [
        headerButtonStyles.base,
        { opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Ionicons name={icon} size={HEADER_ICON_SIZE} color={colors.primary} />
    </Pressable>
  );
};

interface HeaderBackButtonProps {
  onPress: () => void;
  accessibilityLabel?: string;
}

/**
 * Back button with a chevron-back icon
 */
export const HeaderBackButton = ({
  onPress,
  accessibilityLabel = 'Go back',
}: HeaderBackButtonProps) => (
  <HeaderButton
    icon='chevron-back'
    onPress={onPress}
    accessibilityLabel={accessibilityLabel}
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
  />
);
