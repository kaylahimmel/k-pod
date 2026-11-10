import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { getNavigationTheme } from '../navigationTheme';
import { DARK_COLORS, LIGHT_COLORS } from '../../constants';

describe('getNavigationTheme', () => {
  it('builds a light theme from the light palette', () => {
    const theme = getNavigationTheme(false);

    expect(theme.dark).toBe(false);
    expect(theme.fonts).toBe(DefaultTheme.fonts);
    expect(theme.colors).toEqual({
      primary: LIGHT_COLORS.primary,
      background: LIGHT_COLORS.background,
      card: LIGHT_COLORS.cardBackground,
      text: LIGHT_COLORS.textPrimary,
      border: LIGHT_COLORS.border,
      notification: LIGHT_COLORS.danger,
    });
  });

  it('builds a dark theme from the dark palette', () => {
    const theme = getNavigationTheme(true);

    expect(theme.dark).toBe(true);
    expect(theme.fonts).toBe(DarkTheme.fonts);
    expect(theme.colors.background).toBe(DARK_COLORS.background);
    expect(theme.colors.card).toBe(DARK_COLORS.cardBackground);
  });
});
