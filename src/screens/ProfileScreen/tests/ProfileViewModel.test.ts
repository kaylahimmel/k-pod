import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useProfileViewModel } from '../ProfileViewModel';
import { AuthService } from '../../../services';
import {
  createMockListeningHistory,
  createMockPodcasts,
} from '../../../__mocks__';

// Mock the hooks module to control store state
jest.mock('../../../hooks', () => ({
  usePodcastStore: jest.fn(),
  useHistoryStore: jest.fn(),
  useAuthStore: jest.fn(),
}));

// Mock AuthService.signOut used in handleSignOutPress
jest.mock('../../../services', () => ({
  AuthService: {
    signOut: jest.fn().mockResolvedValue({ success: true, data: undefined }),
  },
}));

// eslint-disable-next-line import/first
import { usePodcastStore, useHistoryStore, useAuthStore } from '../../../hooks';

jest.spyOn(Alert, 'alert');

describe('useProfileViewModel', () => {
  const mockOnViewHistoryPress = jest.fn();
  const mockOnChangePasswordPress = jest.fn();
  const mockLoadHistory = jest.fn().mockResolvedValue(undefined);

  const defaultHistory = [
    createMockListeningHistory({ completionPercentage: 100 }),
    createMockListeningHistory({ completionPercentage: 95 }),
    createMockListeningHistory({ completionPercentage: 50 }),
  ];
  const defaultPodcasts = createMockPodcasts(2);

  const defaultAuthUser = {
    id: 'user-1',
    email: 'user@example.com',
    preferences: { theme: 'light' as const, notifications: true },
  };

  const renderViewModel = () =>
    renderHook(() =>
      useProfileViewModel(
        mockOnViewHistoryPress,
        mockOnChangePasswordPress,
      ),
    );

  beforeEach(() => {
    jest.clearAllMocks();
    (usePodcastStore as jest.Mock).mockReturnValue({
      podcasts: defaultPodcasts,
    });
    (useHistoryStore as jest.Mock).mockReturnValue({
      history: defaultHistory,
      isLoading: false,
      loadHistory: mockLoadHistory,
    });
    (useAuthStore as jest.Mock).mockReturnValue({
      user: defaultAuthUser,
    });
  });

  describe('on mount', () => {
    it('should call loadHistory', async () => {
      renderViewModel();

      await waitFor(() => {
        expect(mockLoadHistory).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('user', () => {
    it('should return formatted user from authStore', () => {
      const { result } = renderViewModel();

      expect(result.current.user).not.toBeNull();
      expect(result.current.user?.email).toBe('user@example.com');
      expect(result.current.user?.initials).toBe('US');
    });

    it('should return null when no user is authenticated', () => {
      (useAuthStore as jest.Mock).mockReturnValue({ user: null });

      const { result } = renderViewModel();

      expect(result.current.user).toBeNull();
    });
  });

  describe('stats', () => {
    it('should count subscribed podcasts from store', () => {
      const { result } = renderViewModel();

      expect(result.current.stats.podcastsSubscribed).toBe(2);
      expect(result.current.stats.podcastsSubscribedLabel).toBe('2 Podcasts');
    });

    it('should count episodes with >= 90% completion', () => {
      const { result } = renderViewModel();

      // defaultHistory has 2 items >= 90% (100, 95) and 1 below (50)
      expect(result.current.stats.episodesCompleted).toBe(2);
      expect(result.current.stats.episodesCompletedLabel).toBe('2 Episodes');
    });

    it('should return zero stats for empty history and no podcasts', () => {
      (usePodcastStore as jest.Mock).mockReturnValue({ podcasts: [] });
      (useHistoryStore as jest.Mock).mockReturnValue({
        history: [],
        isLoading: false,
        loadHistory: mockLoadHistory,
      });

      const { result } = renderViewModel();

      expect(result.current.stats.totalListeningTime).toBe('0 min');
      expect(result.current.stats.episodesCompleted).toBe(0);
      expect(result.current.stats.podcastsSubscribed).toBe(0);
    });
  });

  describe('isLoading', () => {
    it('should reflect history store loading state', () => {
      (useHistoryStore as jest.Mock).mockReturnValue({
        history: [],
        isLoading: true,
        loadHistory: mockLoadHistory,
      });

      const { result } = renderViewModel();

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('handleViewHistoryPress', () => {
    it('should call the onViewHistoryPress callback', () => {
      const { result } = renderViewModel();

      act(() => {
        result.current.handleViewHistoryPress();
      });

      expect(mockOnViewHistoryPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleChangePasswordPress', () => {
    it('should call the onChangePasswordPress callback', () => {
      const { result } = renderViewModel();

      act(() => {
        result.current.handleChangePasswordPress();
      });

      expect(mockOnChangePasswordPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleSignOutPress', () => {
    it('should show a sign out confirmation alert', () => {
      const { result } = renderViewModel();

      act(() => {
        result.current.handleSignOutPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Sign Out',
        'Are you sure you want to sign out?',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
          expect.objectContaining({ text: 'Sign Out', style: 'destructive' }),
        ]),
      );
    });

    it('should call AuthService.signOut when the alert is confirmed', async () => {
      const { result } = renderViewModel();

      act(() => {
        result.current.handleSignOutPress();
      });

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const signOutButton = alertCall[2].find(
        (btn: { text: string }) => btn.text === 'Sign Out',
      );

      await act(async () => {
        await signOutButton.onPress();
      });

      expect(AuthService.signOut).toHaveBeenCalledTimes(1);
    });

    it('should not call AuthService.signOut when the alert is cancelled', () => {
      const { result } = renderViewModel();

      act(() => {
        result.current.handleSignOutPress();
      });

      expect(AuthService.signOut).not.toHaveBeenCalled();
    });
  });
});
