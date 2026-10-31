import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert, AlertButton, AppState, Linking } from 'react-native';
import { useNotificationSettingsViewModel } from '../NotificationSettingsViewModel';
import { podcastStore, settingsStore } from '../../../stores';
import {
  NotificationService,
  registerBackgroundRefresh,
  unregisterBackgroundRefresh,
} from '../../../services';
import { createMockPodcast } from '../../../__mocks__';

// Mock the stores
jest.mock('../../../stores', () => ({
  settingsStore: jest.fn(),
  podcastStore: jest.fn(),
}));

// Mock the notification/background services the ViewModel calls
jest.mock('../../../services', () => ({
  NotificationService: {
    requestPermission: jest.fn(),
    getPermissionStatus: jest.fn(),
  },
  registerBackgroundRefresh: jest.fn(),
  unregisterBackgroundRefresh: jest.fn(),
}));

const mockRequestPermission =
  NotificationService.requestPermission as jest.Mock;
const mockGetPermissionStatus =
  NotificationService.getPermissionStatus as jest.Mock;
const mockRegister = registerBackgroundRefresh as jest.Mock;
const mockUnregister = unregisterBackgroundRefresh as jest.Mock;

jest.spyOn(Alert, 'alert');

describe('useNotificationSettingsViewModel', () => {
  const mockUpdateSetting = jest.fn();
  let appStateListener: ((state: string) => void) | undefined;
  const mockRemoveListener = jest.fn();

  const mockSettingsState = (
    overrides: {
      newEpisodeNotifications?: boolean;
      mutedNotificationPodcastIds?: string[];
    } = {},
  ) => {
    (settingsStore as unknown as jest.Mock).mockReturnValue({
      settings: {
        newEpisodeNotifications: false,
        mutedNotificationPodcastIds: [],
        ...overrides,
      },
      updateSetting: mockUpdateSetting,
    });
  };

  // Renders and waits for the permission check that runs on open
  const renderViewModel = async () => {
    const hook = renderHook(() => useNotificationSettingsViewModel());
    await waitFor(() => expect(mockGetPermissionStatus).toHaveBeenCalled());
    await act(async () => {});
    return hook;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    appStateListener = undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, cb) => {
      appStateListener = cb as (state: string) => void;
      return { remove: mockRemoveListener } as unknown as ReturnType<
        typeof AppState.addEventListener
      >;
    });
    mockSettingsState();
    (podcastStore as unknown as jest.Mock).mockReturnValue({ podcasts: [] });
    mockGetPermissionStatus.mockResolvedValue({ success: true, data: true });
    mockRequestPermission.mockResolvedValue({ success: true, data: true });
    mockRegister.mockResolvedValue({ success: true, data: undefined });
    mockUnregister.mockResolvedValue({ success: true, data: undefined });
  });

  describe('notificationPodcasts', () => {
    it('should list subscribed podcasts, enabled unless muted', async () => {
      (podcastStore as unknown as jest.Mock).mockReturnValue({
        podcasts: [
          createMockPodcast({ id: 'p1', title: 'One' }),
          createMockPodcast({ id: 'p2', title: 'Two' }),
        ],
      });
      mockSettingsState({ mutedNotificationPodcastIds: ['p2'] });

      const { result } = await renderViewModel();

      expect(result.current.notificationPodcasts).toEqual([
        { id: 'p1', title: 'One', enabled: true },
        { id: 'p2', title: 'Two', enabled: false },
      ]);
    });
  });

  describe('device permission', () => {
    it('should show alerts on when the setting is on and permission is allowed', async () => {
      mockSettingsState({ newEpisodeNotifications: true });

      const { result } = await renderViewModel();

      expect(result.current.alertsEnabled).toBe(true);
      expect(result.current.isBlockedByDevice).toBe(false);
    });

    it('should show alerts as blocked when permission was revoked', async () => {
      mockSettingsState({ newEpisodeNotifications: true });
      mockGetPermissionStatus.mockResolvedValue({ success: true, data: false });

      const { result } = await renderViewModel();

      expect(result.current.alertsEnabled).toBe(false);
      expect(result.current.isBlockedByDevice).toBe(true);
    });

    it('should keep the saved preference when permission was revoked', async () => {
      mockSettingsState({ newEpisodeNotifications: true });
      mockGetPermissionStatus.mockResolvedValue({ success: true, data: false });

      await renderViewModel();

      expect(mockUpdateSetting).not.toHaveBeenCalled();
    });

    it('should not show blocked when the user turned alerts off', async () => {
      mockGetPermissionStatus.mockResolvedValue({ success: true, data: false });

      const { result } = await renderViewModel();

      expect(result.current.isBlockedByDevice).toBe(false);
    });

    it('should re-check when the app returns to the foreground', async () => {
      mockSettingsState({ newEpisodeNotifications: true });
      const { result } = await renderViewModel();
      expect(result.current.alertsEnabled).toBe(true);

      mockGetPermissionStatus.mockResolvedValue({ success: true, data: false });
      await act(async () => {
        appStateListener?.('active');
      });

      expect(result.current.isBlockedByDevice).toBe(true);
    });

    it('should not re-check when the app moves to the background', async () => {
      await renderViewModel();
      mockGetPermissionStatus.mockClear();

      await act(async () => {
        appStateListener?.('background');
      });

      expect(mockGetPermissionStatus).not.toHaveBeenCalled();
    });

    it('should keep the toggle as saved when the check fails', async () => {
      mockSettingsState({ newEpisodeNotifications: true });
      mockGetPermissionStatus.mockResolvedValue({
        success: false,
        error: 'boom',
      });

      const { result } = await renderViewModel();

      expect(result.current.alertsEnabled).toBe(true);
    });

    it('should stop listening on unmount', async () => {
      const { unmount } = await renderViewModel();

      unmount();

      expect(mockRemoveListener).toHaveBeenCalled();
    });
  });

  describe('handleToggleNotifications', () => {
    it('should request permission, register the task, then turn on', async () => {
      const { result } = await renderViewModel();

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
      const { result } = await renderViewModel();

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

    it('should ask again rather than turn off while blocked by the device', async () => {
      // The switch shows off here, so tapping it means "turn on"
      mockSettingsState({ newEpisodeNotifications: true });
      mockGetPermissionStatus.mockResolvedValue({ success: true, data: false });
      mockRequestPermission.mockResolvedValue({ success: true, data: false });
      const { result } = await renderViewModel();

      await act(async () => {
        await result.current.handleToggleNotifications();
      });

      expect(mockRequestPermission).toHaveBeenCalled();
      expect(mockUnregister).not.toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Notifications Are Off',
        expect.any(String),
        expect.any(Array),
      );
    });

    it('should show an error and stay off when the permission request fails', async () => {
      mockRequestPermission.mockResolvedValue({
        success: false,
        error: 'Failed to request notification permission: boom',
      });
      const { result } = await renderViewModel();

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
      const { result } = await renderViewModel();

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
      const { result } = await renderViewModel();

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
      const { result } = await renderViewModel();

      await act(async () => {
        await result.current.handleToggleNotifications();
      });

      expect(consoleSpy).toHaveBeenCalledWith('broken');
      consoleSpy.mockRestore();
    });
  });

  describe('handleTogglePodcastNotifications', () => {
    it('should mute an unmuted podcast', async () => {
      mockSettingsState({ mutedNotificationPodcastIds: ['p1'] });
      const { result } = await renderViewModel();

      act(() => {
        result.current.handleTogglePodcastNotifications('p2');
      });

      expect(mockUpdateSetting).toHaveBeenCalledWith(
        'mutedNotificationPodcastIds',
        ['p1', 'p2'],
      );
    });

    it('should unmute a muted podcast', async () => {
      mockSettingsState({ mutedNotificationPodcastIds: ['p1', 'p2'] });
      const { result } = await renderViewModel();

      act(() => {
        result.current.handleTogglePodcastNotifications('p1');
      });

      expect(mockUpdateSetting).toHaveBeenCalledWith(
        'mutedNotificationPodcastIds',
        ['p2'],
      );
    });
  });

  describe('handleOpenDeviceSettings', () => {
    it('should open device settings', async () => {
      const openSettings = jest
        .spyOn(Linking, 'openSettings')
        .mockResolvedValue(undefined);
      const { result } = await renderViewModel();

      result.current.handleOpenDeviceSettings();

      expect(openSettings).toHaveBeenCalled();
    });

    it('should alert when device settings cannot open', async () => {
      jest.spyOn(Linking, 'openSettings').mockRejectedValue(new Error('no'));
      const { result } = await renderViewModel();

      await act(async () => {
        result.current.handleOpenDeviceSettings();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Unable to open device settings.',
      );
    });
  });
});
