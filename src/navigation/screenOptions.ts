import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { ThemeColors } from '../constants';

/**
 * Common header button styles for consistent UI across screens
 */
export const headerButtonStyles = StyleSheet.create({
  // Base style for all header buttons
  base: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  // Back button with extra left padding to avoid being too close to edge
  back: {
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 8,
  },
  // Close button style
  close: {
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 8,
  },
  // Action button (like + button) for header right
  action: {
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 8,
  },
});

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
    fontSize: 17,
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
