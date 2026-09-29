import { renderHook, act } from '@testing-library/react-native';
import { useSettingsViewModel } from '../SettingsViewModel';
import { podcastStore, settingsStore } from '../../../stores';
import {
  NotificationService,
  registerBackgroundRefresh,
  unregisterBackgroundRefresh,
} from '../../../services';
import { Alert, AlertButton, Linking } from 'react-native';
import { createMockPodcast } from '../../../__mocks__';

// Mock the stores
jest.mock('../../../stores', () => ({
  settingsStore: jest.fn(),
  podcastStore: jest.fn(),
}));

// Mock the notification/background services the ViewModel calls
jest.mock('../../../services', () => ({
  NotificationService: { requestPermission: jest.fn() },
  registerBackgroundRefresh: jest.fn(),
  unregisterBackgroundRefresh: jest.fn(),
}));

const mockRequestPermission =
  NotificationService.requestPermission as jest.Mock;
const mockRegister = registerBackgroundRefresh as jest.Mock;
const mockUnregister = unregisterBackgroundRefresh as jest.Mock;

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
    newEpisodeNotifications: false,
    mutedNotificationPodcastIds: [] as string[],
  };

  const mockSettingsState = (
    overrides: Partial<typeof defaultSettings> = {},
  ) => {
    (settingsStore as unknown as jest.Mock).mockReturnValue({
      settings: { ...defaultSettings, ...overrides },
      loading: false,
      updateSetting: mockUpdateSetting,
      resetSettings: mockResetSettings,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSettingsState();
    (podcastStore as unknown as jest.Mock).mockReturnValue({ podcasts: [] });
    mockRequestPermission.mockResolvedValue({ success: true, data: true });
    mockRegister.mockResolvedValue({ success: true, data: undefined });
    mockUnregister.mockResolvedValue({ success: true, data: undefined });
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
      // Defaults turn notifications off, so the background task goes too
      expect(mockUnregister).toHaveBeenCalled();
    });
  });

  describe('notificationPodcasts', () => {
    it('should list subscribed podcasts, enabled unless muted', () => {
      (podcastStore as unknown as jest.Mock).mockReturnValue({
        podcasts: [
          createMockPodcast({ id: 'p1', title: 'One' }),
          createMockPodcast({ id: 'p2', title: 'Two' }),
        ],
      });
      mockSettingsState({ mutedNotificationPodcastIds: ['p2'] });

      const { result } = renderHook(() => useSettingsViewModel());

      expect(result.current.notificationPodcasts).toEqual([
        { id: 'p1', title: 'One', enabled: true },
        { id: 'p2', title: 'Two', enabled: false },
      ]);
    });
  });

  describe('handleToggleNotifications', () => {
    it('should request permission, register the task, then turn on', async () => {
      const { result } = renderHook(() => useSettingsViewModel());

      await act(async () => {
        await result.current.handleToggleNotifications();
      });

      expect(mockRequestPermission).toHaveBeenCalled();
      expect(mockRegister).toHaveBeenCalled();
      expect(mockUpdateSetting).toHaveBeenCalledWith(
        'newEpisodeNotifications',
        true,
      );
    });

    it('should keep the toggle off and offer Settings when permission is denied', async () => {
      mockRequestPermission.mockResolvedValue({ success: true, data: false });
      const openSettings = jest
        .spyOn(Linking, 'openSettings')
        .mockResolvedValue(undefined);
      const { result } = renderHook(() => useSettingsViewModel());

      await act(async () => {
        await result.current.handleToggleNotifications();
      });

      expect(mockUpdateSetting).not.toHaveBeenCalled();
      expect(mockRegister).not.toHaveBeenCalled();

      const buttons = (Alert.alert as jest.Mock).mock
        .calls[0][2] as AlertButton[];
      const openButton = buttons.find((b) => b.text === 'Open Settings');
      openButton?.onPress?.();

      expect(openSettings).toHaveBeenCalled();
    });

    it('should show an error and stay off when the permission request fails', async () => {
      mockRequestPermission.mockResolvedValue({
        success: false,
        error: 'Failed to request notification permission: boom',
      });
      const { result } = renderHook(() => useSettingsViewModel());

      await act(async () => {
        await result.current.handleToggleNotifications();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to request notification permission: boom',
      );
      expect(mockUpdateSetting).not.toHaveBeenCalled();
    });

    it('should show an error and stay off when registration fails', async () => {
      mockRegister.mockResolvedValue({
        success: false,
        error: 'Background refresh is not available on this device.',
      });
      const { result } = renderHook(() => useSettingsViewModel());

      await act(async () => {
        await result.current.handleToggleNotifications();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Background refresh is not available on this device.',
      );
      expect(mockUpdateSetting).not.toHaveBeenCalled();
    });

    it('should turn off and unregister the task when on', async () => {
      mockSettingsState({ newEpisodeNotifications: true });
      const { result } = renderHook(() => useSettingsViewModel());

      await act(async () => {
        await result.current.handleToggleNotifications();
      });

      expect(mockUpdateSetting).toHaveBeenCalledWith(
        'newEpisodeNotifications',
        false,
      );
      expect(mockUnregister).toHaveBeenCalled();
      expect(mockRequestPermission).not.toHaveBeenCalled();
    });

    it('should log when unregistering fails', async () => {
      mockSettingsState({ newEpisodeNotifications: true });
      mockUnregister.mockResolvedValue({ success: false, error: 'broken' });
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const { result } = renderHook(() => useSettingsViewModel());

      await act(async () => {
        await result.current.handleToggleNotifications();
      });

      expect(consoleSpy).toHaveBeenCalledWith('broken');
      consoleSpy.mockRestore();
    });
  });

  describe('handleTogglePodcastNotifications', () => {
    it('should mute an unmuted podcast', () => {
      mockSettingsState({ mutedNotificationPodcastIds: ['p1'] });
      const { result } = renderHook(() => useSettingsViewModel());

      act(() => {
        result.current.handleTogglePodcastNotifications('p2');
      });

      expect(mockUpdateSetting).toHaveBeenCalledWith(
        'mutedNotificationPodcastIds',
        ['p1', 'p2'],
      );
    });

    it('should unmute a muted podcast', () => {
      mockSettingsState({ mutedNotificationPodcastIds: ['p1', 'p2'] });
      const { result } = renderHook(() => useSettingsViewModel());

      act(() => {
        result.current.handleTogglePodcastNotifications('p1');
      });

      expect(mockUpdateSetting).toHaveBeenCalledWith(
        'mutedNotificationPodcastIds',
        ['p2'],
      );
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
