import { renderHook, act } from '@testing-library/react-native';
import { Appearance, useColorScheme } from 'react-native';
import {
  resolveIsDarkMode,
  useAppearancePreference,
  useIsDarkMode,
  useThemeColors,
  useThemedStyles,
} from '../useThemeColors';
import { settingsStore } from '../../stores';
import { ThemePreference } from '../../models';
import { DARK_COLORS, LIGHT_COLORS, ThemeColors } from '../../constants';

// Override only the two pieces under test on top of the real module (see
// CLAUDE.md: never replace all of react-native with a factory)
jest.mock('react-native', () =>
  Object.setPrototypeOf(
    {
      useColorScheme: jest.fn(() => 'light'),
      Appearance: { setColorScheme: jest.fn() },
    },
    jest.requireActual('react-native'),
  ),
);

const mockUseColorScheme = useColorScheme as jest.Mock;
const mockSetColorScheme = Appearance.setColorScheme as jest.Mock;

const setPreference = (preference: ThemePreference) => {
  act(() => {
    settingsStore.getState().updateSetting('themePreference', preference);
  });
};

describe('useThemeColors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseColorScheme.mockReturnValue('light');
    settingsStore.getState().resetSettings();
  });

  describe('resolveIsDarkMode', () => {
    it.each([
      ['system', 'light', false],
      ['system', 'dark', true],
      ['system', null, false],
      ['light', 'dark', false],
      ['dark', 'light', true],
    ] as const)(
      'preference %s with a %s phone is dark: %s',
      (preference, phone, expected) => {
        expect(resolveIsDarkMode(preference, phone)).toBe(expected);
      },
    );
  });

  describe('useThemeColors', () => {
    it('follows a light phone by default', () => {
      const { result } = renderHook(() => useThemeColors());
      expect(result.current).toBe(LIGHT_COLORS);
    });

    it('follows a dark phone by default', () => {
      mockUseColorScheme.mockReturnValue('dark');
      const { result } = renderHook(() => useThemeColors());
      expect(result.current).toBe(DARK_COLORS);
    });

    it('switches as soon as the in-app choice changes', () => {
      const { result } = renderHook(() => useThemeColors());

      setPreference('dark');
      expect(result.current).toBe(DARK_COLORS);

      setPreference('light');
      expect(result.current).toBe(LIGHT_COLORS);
    });

    it('keeps a saved light choice on a dark phone', () => {
      mockUseColorScheme.mockReturnValue('dark');
      setPreference('light');
      const { result } = renderHook(() => useIsDarkMode());
      expect(result.current).toBe(false);
    });
  });

  describe('useThemedStyles', () => {
    const createStyles = jest.fn((colors: ThemeColors) => ({
      text: { color: colors.textPrimary },
    }));

    it('builds styles from the active palette', () => {
      const { result } = renderHook(() => useThemedStyles(createStyles));
      expect(result.current.text.color).toBe(LIGHT_COLORS.textPrimary);
    });

    it('reuses the same styles across re-renders until the theme changes', () => {
      const { result, rerender } = renderHook(() =>
        useThemedStyles(createStyles),
      );
      const first = result.current;

      rerender({});
      expect(result.current).toBe(first);
      expect(createStyles).toHaveBeenCalledTimes(1);

      setPreference('dark');
      expect(result.current).not.toBe(first);
      expect(result.current.text.color).toBe(DARK_COLORS.textPrimary);
    });
  });

  describe('useAppearancePreference', () => {
    it('hands control to the phone while following it', () => {
      renderHook(() => useAppearancePreference());
      expect(mockSetColorScheme).toHaveBeenLastCalledWith('unspecified');
    });

    it('overrides the whole app when a choice is saved', () => {
      renderHook(() => useAppearancePreference());

      setPreference('dark');
      expect(mockSetColorScheme).toHaveBeenLastCalledWith('dark');

      setPreference('light');
      expect(mockSetColorScheme).toHaveBeenLastCalledWith('light');
    });

    it('goes back to the phone after Reset All Settings', () => {
      renderHook(() => useAppearancePreference());
      setPreference('dark');

      act(() => {
        settingsStore.getState().resetSettings();
      });

      expect(mockSetColorScheme).toHaveBeenLastCalledWith('unspecified');
    });
  });
});
