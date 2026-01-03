import { renderHook, act } from '@testing-library/react-native';
import settingsStore from '../../stores/settingsStore';
import { useSettingsStore } from '../useSettingsStore';

describe('useSettingsStore', () => {
  afterEach(() => {
    settingsStore.getState().resetSettings();
    settingsStore.getState().setLoading(false);
    settingsStore.getState().setError(null);
  });

  it('exposes default settings', () => {
    const { result } = renderHook(() => useSettingsStore());

    expect(result.current.settings.autoPlayNext).toBe(true);
    expect(result.current.settings.defaultSpeed).toBe(1);
    expect(result.current.settings.downloadOnWiFi).toBe(true);
    expect(result.current.settings.skipForwardSeconds).toBe(30);
    expect(result.current.settings.skipBackwardSeconds).toBe(15);
  });

  it('updates individual settings with updateSetting', () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.updateSetting('defaultSpeed', 1.5);
    });
    expect(result.current.settings.defaultSpeed).toBe(1.5);

    act(() => {
      result.current.updateSetting('autoPlayNext', false);
    });
    expect(result.current.settings.autoPlayNext).toBe(false);

    // other settings unchanged
    expect(result.current.settings.skipForwardSeconds).toBe(30);
  });

  it('updates multiple settings at once with updateSettings', () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.updateSettings({
        defaultSpeed: 0.75,
        skipForwardSeconds: 45,
      });
    });

    expect(result.current.settings.defaultSpeed).toBe(0.75);
    expect(result.current.settings.skipForwardSeconds).toBe(45);
    expect(result.current.settings.autoPlayNext).toBe(true); // unchanged
  });

  it('loads settings from storage', () => {
    const { result } = renderHook(() => useSettingsStore());

    const newSettings = {
      autoPlayNext: false,
      defaultSpeed: 2,
      downloadOnWiFi: false,
      skipForwardSeconds: 60,
      skipBackwardSeconds: 30,
    };

    act(() => {
      result.current.loadSettings(newSettings);
    });

    expect(result.current.settings).toEqual(newSettings);
  });

  it('resets settings to defaults', () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.updateSettings({ defaultSpeed: 0.5, autoPlayNext: false });
    });

    act(() => {
      result.current.resetSettings();
    });

    expect(result.current.settings.defaultSpeed).toBe(1);
    expect(result.current.settings.autoPlayNext).toBe(true);
  });

  it('manages loading and error states', () => {
    const { result } = renderHook(() => useSettingsStore());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();

    act(() => {
      result.current.setLoading(true);
    });
    expect(result.current.loading).toBe(true);

    act(() => {
      result.current.setError('Failed to load settings');
    });
    expect(result.current.error).toBe('Failed to load settings');

    act(() => {
      result.current.setLoading(false);
      result.current.setError(null);
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
