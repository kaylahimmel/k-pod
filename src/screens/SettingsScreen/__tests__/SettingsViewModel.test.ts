import { renderHook, act } from '@testing-library/react-native';
import { useSettingsViewModel } from '../SettingsViewModel';
import { podcastStore, settingsStore } from '../../../stores';
import { authStore } from '../../../stores/authStore';
import { historyStore } from '../../../stores/historyStore';
import { AuthService, unregisterBackgroundRefresh } from '../../../services';
import { Alert } from 'react-native';
import {
  createMockAppSettings,
  createMockEpisode,
  createMockListeningHistory,
  createMockPodcasts,
  createMockUser,
} from '../../../__mocks__';

// Mock the stores
jest.mock('../../../stores', () => ({
  settingsStore: jest.fn(),
  podcastStore: jest.fn(),
}));

// Mock the background service the ViewModel calls
jest.mock('../../../services', () => ({
  unregisterBackgroundRefresh: jest.fn(),
  AuthService: { signOut: jest.fn() },
}));

const mockUnregister = unregisterBackgroundRefresh as jest.Mock;

jest.spyOn(Alert, 'alert');

describe('useSettingsViewModel', () => {
  const mockUpdateSetting = jest.fn();
  const mockResetSettings = jest.fn();

  const defaultSettings = createMockAppSettings();

  const mockSettingsState = (
    overrides: Partial<typeof defaultSettings> = {},
  ) => {
    const state = {
      settings: { ...defaultSettings, ...overrides },
      updateSetting: mockUpdateSetting,
      resetSettings: mockResetSettings,
    };
    // Honor selectors: useIsDarkMode() reads one field with
    // settingsStore((state) => ...), while useSettingsStore() takes it all
    (settingsStore as unknown as jest.Mock).mockImplementation(
      (selector?: (s: typeof state) => unknown) =>
        selector ? selector(state) : state,
    );
  };

  // The ViewModel reads podcastStore with a selector, so the mock runs it
  const mockPodcasts = (podcasts: ReturnType<typeof createMockPodcasts>) => {
    (podcastStore as unknown as jest.Mock).mockImplementation(
      (selector: (s: { podcasts: typeof podcasts }) => unknown) =>
        selector({ podcasts }),
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSettingsState();
    mockUnregister.mockResolvedValue({ success: true, data: undefined });
    mockPodcasts([]);
    // Auth and history are the real stores (the ViewModel imports them from
    // their own files, not the mocked barrel), reset to empty here
    authStore.setState({ user: null });
    historyStore.setState({ history: [] });
  });

  it('should return the download setting', () => {
    const { result } = renderHook(() => useSettingsViewModel());

    expect(result.current.downloadOnWiFi).toBe(true);
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

    it('should show a toast once reset is confirmed', () => {
      const { result } = renderHook(() => useSettingsViewModel());

      act(() => {
        result.current.handleResetSettings();
      });

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const resetButton = alertCall[2].find(
        (btn: { text: string }) => btn.text === 'Reset',
      );

      act(() => {
        resetButton.onPress();
      });

      expect(result.current.toast.showToast).toHaveBeenCalledWith(
        'Settings reset to defaults',
      );
    });

    it('should not show a toast before reset is confirmed', () => {
      const { result } = renderHook(() => useSettingsViewModel());

      act(() => {
        result.current.handleResetSettings();
      });

      expect(result.current.toast.showToast).not.toHaveBeenCalled();
    });
  });

  describe('dark mode', () => {
    // Jest's React Native reports a light phone, so 'system' reads as light
    it('should show the switch off while following a light phone', () => {
      const { result } = renderHook(() => useSettingsViewModel());

      expect(result.current.isDarkMode).toBe(false);
    });

    it('should save dark when the switch is turned on', () => {
      const { result } = renderHook(() => useSettingsViewModel());

      act(() => {
        result.current.handleToggleDarkMode();
      });

      expect(mockUpdateSetting).toHaveBeenCalledWith('themePreference', 'dark');
    });

    it('should save light, not system, when the switch is turned off', () => {
      mockSettingsState({ themePreference: 'dark' });
      const { result } = renderHook(() => useSettingsViewModel());

      expect(result.current.isDarkMode).toBe(true);

      act(() => {
        result.current.handleToggleDarkMode();
      });

      expect(mockUpdateSetting).toHaveBeenCalledWith(
        'themePreference',
        'light',
      );
    });
  });

  describe('account and listening stats', () => {
    it('should show the signed-in email and initials', () => {
      authStore.setState({
        user: createMockUser({ email: 'kayla.h@example.com' }),
      });
      const { result } = renderHook(() => useSettingsViewModel());

      expect(result.current.account).toEqual({
        email: 'kayla.h@example.com',
        initials: 'KH',
      });
    });

    it('should build stats from history and subscriptions', () => {
      mockPodcasts(createMockPodcasts(2));
      historyStore.setState({
        history: [
          createMockListeningHistory({
            episode: createMockEpisode({ duration: 600 }),
            completionPercentage: 100,
          }),
        ],
      });
      const { result } = renderHook(() => useSettingsViewModel());

      expect(result.current.listeningStats).toEqual([
        { label: 'Listening Time', value: '10 min' },
        { label: 'Episodes', value: 1 },
        { label: 'Subscribed', value: 2 },
      ]);
    });

    it('should sign out only after the user confirms', async () => {
      const { result } = renderHook(() => useSettingsViewModel());

      act(() => {
        result.current.handleSignOutPress();
      });
      expect(AuthService.signOut).not.toHaveBeenCalled();

      const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
      const signOutButton = buttons.find(
        (button: { text: string }) => button.text === 'Sign Out',
      );
      await act(async () => {
        await signOutButton.onPress();
      });

      expect(AuthService.signOut).toHaveBeenCalledTimes(1);
    });
  });
});
