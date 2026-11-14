import { useEffect } from 'react';
import { Appearance, ColorSchemeName, useColorScheme } from 'react-native';
import { DARK_COLORS, LIGHT_COLORS, ThemeColors } from '../constants';
import { ThemePreference } from '../models';
import { settingsStore } from '../stores';

/**
 * Decides light or dark from the saved preference and the phone's setting.
 * A saved 'light' or 'dark' wins; 'system' defers to the phone
 */
export function resolveIsDarkMode(
  preference: ThemePreference,
  systemScheme: ColorSchemeName | null | undefined,
): boolean {
  if (preference === 'system') {
    return systemScheme === 'dark';
  }
  return preference === 'dark';
}

/**
 * Whether the app is currently dark. Reads the saved preference directly
 * instead of trusting useColorScheme() alone: the operating system reports
 * an override back to useColorScheme() asynchronously, so the switch and the
 * colors would otherwise lag a frame (or more) behind the tap
 */
export function useIsDarkMode(): boolean {
  const preference = settingsStore((state) => state.settings.themePreference);
  const systemScheme = useColorScheme();
  return resolveIsDarkMode(preference, systemScheme);
}

/**
 * Returns the active color palette, and re-renders the caller whenever the
 * phone's setting or the in-app Dark Mode choice changes
 */
export function useThemeColors(): ThemeColors {
  return useIsDarkMode() ? DARK_COLORS : LIGHT_COLORS;
}

// One styles object per (createStyles function, palette) pair, shared by
// every component that asks for it. A WeakMap so a createStyles function that
// is ever thrown away (e.g. in a test) doesn't keep its styles alive
const themedStylesCache = new WeakMap<object, Map<ThemeColors, unknown>>();

/**
 * Returns the styles `createStyles` builds for `colors`, building them only
 * the first time that pair is asked for. There are only two palettes, so each
 * `*.styles.ts` file runs at most twice for the life of the app
 */
export function getThemedStyles<T>(
  createStyles: (colors: ThemeColors) => T,
  colors: ThemeColors,
): T {
  let stylesByPalette = themedStylesCache.get(createStyles);
  if (!stylesByPalette) {
    stylesByPalette = new Map();
    themedStylesCache.set(createStyles, stylesByPalette);
  }
  if (!stylesByPalette.has(colors)) {
    stylesByPalette.set(colors, createStyles(colors));
  }
  return stylesByPalette.get(colors) as T;
}

/**
 * Builds a component's styles from the active palette. Pass the
 * `createStyles` function exported by a `*.styles.ts` file (defined at module
 * level, never inline, so it's the same function on every render).
 *
 * Styles are cached app-wide, not per component: every row in a long list
 * shares one styles object instead of each running StyleSheet.create when it
 * mounts, and a re-render (every second during playback) costs two lookups
 */
export function useThemedStyles<T>(
  createStyles: (colors: ThemeColors) => T,
): T {
  return getThemedStyles(createStyles, useThemeColors());
}

/**
 * Applies the saved Dark Mode choice to the whole app. Mounted once, in
 * App.tsx. Appearance.setColorScheme() overrides the look at the operating
 * system level, so native pieces the app doesn't draw (Alerts, the keyboard,
 * the status bar) switch too. 'unspecified' hands control back to the
 * phone's setting.
 *
 * Before settings load from storage, the preference reads as its default,
 * 'system', which is also what the app does with no override. A saved
 * choice applies as soon as storage loads, so a launch on a phone set the
 * other way can briefly show the phone's look first
 */
export function useAppearancePreference(): void {
  const preference = settingsStore((state) => state.settings.themePreference);

  useEffect(() => {
    Appearance.setColorScheme(
      preference === 'system' ? 'unspecified' : preference,
    );
  }, [preference]);
}
