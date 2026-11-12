import { renderHook, act } from '@testing-library/react-native';
import { settingsStore } from '../../stores';
import { useSettingsStore } from '../useSettingsStore';
import { createMockAppSettings } from '../../__mocks__';

describe('useSettingsStore', () => {
  afterEach(() => {
    // Wrapped in act() because store actions can trigger re-renders in mounted hooks
    act(() => {
      settingsStore.getState().resetSettings();
    });
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

    const newSettings = createMockAppSettings({
      autoPlayNext: false,
      defaultSpeed: 2,
      downloadOnWiFi: false,
      skipForwardSeconds: 60,
      skipBackwardSeconds: 30,
    });

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
});
