import { useColorScheme } from 'react-native';
import { settingsStore } from '../stores';
import { LIGHT_COLORS, DARK_COLORS, ColorPalette } from '../constants';

export const useColors = (): ColorPalette => {
  const themePreference = settingsStore((s) => s.settings.themePreference);
  const systemScheme = useColorScheme();

  const effectiveTheme =
    themePreference === 'system' ? (systemScheme ?? 'light') : themePreference;

  return effectiveTheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
};
