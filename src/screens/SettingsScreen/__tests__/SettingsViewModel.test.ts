import { renderHook, act } from '@testing-library/react-native';
import { useSettingsViewModel } from '../SettingsViewModel';
import { settingsStore } from '../../../stores';
import { Alert, Linking } from 'react-native';

// Mock the stores
jest.mock('../../../stores', () => ({
  settingsStore: jest.fn(),
}));

// Mock Alert and Linking
jest.spyOn(Alert, 'alert');
jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

describe('useSettingsViewModel', () => {
  const mockUpdateSetting = jest.fn();
  const mockResetSettings = jest.fn();

  const defaultSettings = {
    autoPlayNext: true,
    defaultSpeed: 1,
    downloadOnWiFi: true,
    skipForwardSeconds: 30,
    skipBackwardSeconds: 15,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (settingsStore as unknown as jest.Mock).mockReturnValue({
      settings: defaultSettings,
      loading: false,
      updateSetting: mockUpdateSetting,
      resetSettings: mockResetSettings,
    });
  });

  it('should return formatted settings', () => {
    const { result } = renderHook(() => useSettingsViewModel());

    expect(result.current.settings.autoPlayNext).toBe(true);
    expect(result.current.settings.defaultSpeed).toBe(1);
    expect(result.current.settings.defaultSpeedLabel).toBe('1x (Normal)');
    expect(result.current.settings.downloadOnWiFi).toBe(true);
    expect(result.current.settings.skipForwardSeconds).toBe(30);
    expect(result.current.settings.skipForwardLabel).toBe('30 sec');
    expect(result.current.settings.skipBackwardSeconds).toBe(15);
    expect(result.current.settings.skipBackwardLabel).toBe('15 sec');
  });

  it('should return loading state', () => {
    (settingsStore as unknown as jest.Mock).mockReturnValue({
      settings: defaultSettings,
      loading: true,
      updateSetting: mockUpdateSetting,
      resetSettings: mockResetSettings,
    });

    const { result } = renderHook(() => useSettingsViewModel());

    expect(result.current.isLoading).toBe(true);
  });

  it('should return speed options', () => {
    const { result } = renderHook(() => useSettingsViewModel());

    expect(result.current.speedOptions).toHaveLength(7);
    expect(result.current.speedOptions[0].value).toBe(0.5);
  });

  it('should return skip options', () => {
    const { result } = renderHook(() => useSettingsViewModel());

    expect(result.current.skipForwardOptions).toHaveLength(5);
    expect(result.current.skipBackwardOptions).toHaveLength(4);
  });

  it('should return app version', () => {
    const { result } = renderHook(() => useSettingsViewModel());

    expect(result.current.appVersion).toBe('1.0.0');
  });

  describe('handleToggleAutoPlayNext', () => {
    it('should toggle auto-play next setting', () => {
      const { result } = renderHook(() => useSettingsViewModel());

      act(() => {
        result.current.handleToggleAutoPlayNext();
      });

      expect(mockUpdateSetting).toHaveBeenCalledWith('autoPlayNext', false);
    });
  });

  describe('handleSpeedChange', () => {
    it('should update playback speed', () => {
      const { result } = renderHook(() => useSettingsViewModel());

      act(() => {
        result.current.handleSpeedChange(1.5);
      });

      expect(mockUpdateSetting).toHaveBeenCalledWith('defaultSpeed', 1.5);
    });
  });

  describe('handleToggleDownloadOnWiFi', () => {
    it('should toggle download on WiFi setting', () => {
      const { result } = renderHook(() => useSettingsViewModel());

      act(() => {
        result.current.handleToggleDownloadOnWiFi();
      });

      expect(mockUpdateSetting).toHaveBeenCalledWith('downloadOnWiFi', false);
    });
  });

  describe('handleSkipForwardChange', () => {
    it('should update skip forward seconds', () => {
      const { result } = renderHook(() => useSettingsViewModel());

      act(() => {
        result.current.handleSkipForwardChange(45);
      });

      expect(mockUpdateSetting).toHaveBeenCalledWith('skipForwardSeconds', 45);
    });
  });

  describe('handleSkipBackwardChange', () => {
    it('should update skip backward seconds', () => {
      const { result } = renderHook(() => useSettingsViewModel());

      act(() => {
        result.current.handleSkipBackwardChange(10);
      });

      expect(mockUpdateSetting).toHaveBeenCalledWith('skipBackwardSeconds', 10);
    });
  });

  describe('handleResetSettings', () => {
    it('should show confirmation alert', () => {
      const { result } = renderHook(() => useSettingsViewModel());

      act(() => {
        result.current.handleResetSettings();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Reset Settings',
        'Are you sure you want to reset all settings to their defaults?',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
          expect.objectContaining({ text: 'Reset', style: 'destructive' }),
        ]),
      );
    });

    it('should call resetSettings when confirmed', () => {
      const { result } = renderHook(() => useSettingsViewModel());

      act(() => {
        result.current.handleResetSettings();
      });

      // Simulate pressing Reset button in alert
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const resetButton = alertCall[2].find(
        (btn: { text: string }) => btn.text === 'Reset',
      );

      act(() => {
        resetButton.onPress();
      });

      expect(mockResetSettings).toHaveBeenCalled();
    });
  });

  describe('handlePrivacyPolicyPress', () => {
    it('should open privacy policy URL', async () => {
      const { result } = renderHook(() => useSettingsViewModel());

      await act(async () => {
        await result.current.handlePrivacyPolicyPress();
      });

      expect(Linking.openURL).toHaveBeenCalledWith(
        'https://example.com/privacy',
      );
    });
  });

  describe('handleTermsOfServicePress', () => {
    it('should open terms of service URL', async () => {
      const { result } = renderHook(() => useSettingsViewModel());

      await act(async () => {
        await result.current.handleTermsOfServicePress();
      });

      expect(Linking.openURL).toHaveBeenCalledWith('https://example.com/terms');
    });
  });
});
