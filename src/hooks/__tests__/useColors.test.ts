import { renderHook } from '@testing-library/react-native';
import * as ReactNative from 'react-native';
import { useColors } from '../useColors';
import { settingsStore } from '../../stores';
import { LIGHT_COLORS, DARK_COLORS } from '../../constants';
import { SettingsStore } from '../../models';

jest.mock('../../stores', () => ({
  settingsStore: jest.fn(),
}));

const mockSettingsStore = settingsStore as unknown as jest.Mock;
let useColorSchemeSpy: jest.SpyInstance;

const mockStoreWith = (themePreference: 'system' | 'light' | 'dark') => {
  const state: Partial<SettingsStore> = {
    settings: {
      autoPlayNext: true,
      defaultSpeed: 1,
      downloadOnWiFi: true,
      skipForwardSeconds: 30,
      skipBackwardSeconds: 15,
      themePreference,
    },
  };
  mockSettingsStore.mockImplementation(
    (selector: (s: Partial<SettingsStore>) => unknown) => selector(state),
  );
};

describe('useColors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useColorSchemeSpy = jest
      .spyOn(ReactNative, 'useColorScheme')
      .mockReturnValue('light');
  });

  afterEach(() => {
    useColorSchemeSpy.mockRestore();
  });

  it('returns light colors when preference is light', () => {
    mockStoreWith('light');
    const { result } = renderHook(() => useColors());
    expect(result.current).toBe(LIGHT_COLORS);
  });

  it('returns dark colors when preference is dark', () => {
    mockStoreWith('dark');
    const { result } = renderHook(() => useColors());
    expect(result.current).toBe(DARK_COLORS);
  });

  it('returns light colors when preference is system and system scheme is light', () => {
    useColorSchemeSpy.mockReturnValue('light');
    mockStoreWith('system');
    const { result } = renderHook(() => useColors());
    expect(result.current).toBe(LIGHT_COLORS);
  });

  it('returns dark colors when preference is system and system scheme is dark', () => {
    useColorSchemeSpy.mockReturnValue('dark');
    mockStoreWith('system');
    const { result } = renderHook(() => useColors());
    expect(result.current).toBe(DARK_COLORS);
  });

  it('falls back to light when preference is system and system scheme is null', () => {
    useColorSchemeSpy.mockReturnValue(null);
    mockStoreWith('system');
    const { result } = renderHook(() => useColors());
    expect(result.current).toBe(LIGHT_COLORS);
  });
});
