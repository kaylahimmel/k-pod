import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import React from 'react';
import { ThemeColors } from '../constants';
// Imported from its file, not the components barrel, to keep the import graph
// small (the barrel pulls in every component)
import { NavigationBackButton } from '../components/NavigationBackButton/NavigationBackButton';

// Header options shared by stack screens and modals. The header and screen
// backgrounds aren't set here: native stack already takes them from the
// navigation theme (navigationTheme.ts maps `card` to cardBackground and
// `background` to background), so setting them twice could only drift.
// headerTintColor stays because Android's default is the text color, not blue
const getSharedHeaderOptions = (
  colors: ThemeColors,
): NativeStackNavigationOptions => ({
  headerTintColor: colors.primary,
  headerTitleStyle: {
    fontWeight: '600',
    fontSize: 19,
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
  // Every pushed screen gets our back button instead of the native one, so it
  // matches the other header buttons (see HeaderButton.styles.ts). canGoBack
  // is false on each stack's first screen, which keeps it empty there
  headerBackVisible: false,
  headerLeft: ({ canGoBack }) => (canGoBack ? <NavigationBackButton /> : null),
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
