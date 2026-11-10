import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { DARK_COLORS, LIGHT_COLORS, ThemeColors } from '../constants';

const buildTheme = (colors: ThemeColors, base: Theme): Theme => ({
  ...base,
  colors: {
    ...base.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.cardBackground,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.danger,
  },
});

// Built once, since both depend only on constants
const LIGHT_NAVIGATION_THEME = buildTheme(LIGHT_COLORS, DefaultTheme);
const DARK_NAVIGATION_THEME = buildTheme(DARK_COLORS, DarkTheme);

/**
 * React Navigation's theme, built from our palette. NavigationContainer uses
 * it for anything a screen doesn't style itself: the space behind screens
 * during transitions, the auth stack's background, and default header and
 * tab bar colors. Starting from DarkTheme/DefaultTheme keeps its fonts and
 * tells it whether the theme is dark. Takes the answer from useIsDarkMode()
 * rather than guessing it from which palette object it was handed
 */
export const getNavigationTheme = (isDarkMode: boolean): Theme =>
  isDarkMode ? DARK_NAVIGATION_THEME : LIGHT_NAVIGATION_THEME;
