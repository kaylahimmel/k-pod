import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { ThemeColors } from '../constants';

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

// Header and background colors shared by stack screens and modals
const getSharedHeaderOptions = (
  colors: ThemeColors,
): NativeStackNavigationOptions => ({
  headerStyle: {
    backgroundColor: colors.cardBackground,
  },
  headerTintColor: colors.primary,
  headerTitleStyle: {
    fontWeight: '600',
    fontSize: 19,
  },
  contentStyle: {
    backgroundColor: colors.background,
  },
});

/**
 * Default screen options for all stack navigators
 * Provides consistent header styling across the app. A function of the
 * palette so headers switch with the theme; navigators call it through
 * useThemedStyles(getDefaultScreenOptions)
 */
export const getDefaultScreenOptions = (
  colors: ThemeColors,
): NativeStackNavigationOptions => ({
  ...getSharedHeaderOptions(colors),
  headerBackButtonDisplayMode: 'minimal',
  headerShadowVisible: true,
});

/**
 * Modal screen options for full-screen modals
 */
export const getModalScreenOptions = (
  colors: ThemeColors,
): NativeStackNavigationOptions => ({
  ...getSharedHeaderOptions(colors),
  presentation: 'modal',
});
