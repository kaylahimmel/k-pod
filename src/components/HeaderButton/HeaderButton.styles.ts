import { StyleSheet } from 'react-native';

/**
 * Shared header button style. A fixed square with the icon centered and no
 * padding: on iOS 26+ the system wraps each header button in a "glass" pill
 * sized to its content, so any uneven or extra padding stretched the pill into
 * an oval. HEADER_BUTTON_HIT_SLOP keeps the tap area at least 44 points
 */
export const headerButtonStyles = StyleSheet.create({
  base: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const HEADER_BUTTON_HIT_SLOP = { top: 4, bottom: 4, left: 4, right: 4 };

/**
 * Icon size for header buttons. Their color depends on the theme, so header
 * buttons read colors.primary from useThemeColors()
 */
export const HEADER_ICON_SIZE = 28;
