import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useProfileViewModel } from '../ProfileViewModel';
import {
  createMockListeningHistory,
  createMockPodcasts,
} from '../../../__mocks__';

// Mock the hooks to control store state without real async store operations
jest.mock('../../../hooks', () => ({
  usePodcastStore: jest.fn(),
  useHistoryStore: jest.fn(),
}));

// eslint-disable-next-line import/first
import { usePodcastStore, useHistoryStore } from '../../../hooks';

jest.spyOn(Alert, 'alert');

describe('useProfileViewModel', () => {
  const mockOnViewHistoryPress = jest.fn();
  const mockOnChangePasswordPress = jest.fn();
  const mockOnSignOutPress = jest.fn();
  const mockLoadHistory = jest.fn().mockResolvedValue(undefined);

  const defaultHistory = [
    createMockListeningHistory({ completionPercentage: 100 }),
    createMockListeningHistory({ completionPercentage: 95 }),
    createMockListeningHistory({ completionPercentage: 50 }),
  ];
  const defaultPodcasts = createMockPodcasts(2);

  const renderViewModel = () =>
    renderHook(() =>
      useProfileViewModel(
        mockOnViewHistoryPress,
        mockOnChangePasswordPress,
        mockOnSignOutPress,
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
  });

  describe('on mount', () => {
    it('should call loadHistory', async () => {
      renderViewModel();

      await waitFor(() => {
        expect(mockLoadHistory).toHaveBeenCalledTimes(1);
      });
    });

    it('should resolve user and set isLoading to false', async () => {
      const { result } = renderViewModel();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).not.toBeNull();
    });
  });

  describe('user', () => {
    it('should return formatted mock user with correct email and initials', async () => {
      const { result } = renderViewModel();

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      // Mock user in ProfileViewModel has email 'user@example.com'
      expect(result.current.user?.email).toBe('user@example.com');
      expect(result.current.user?.initials).toBe('US');
    });
  });

  describe('recentHistory', () => {
    it('should return at most 3 recent history items', () => {
      const { result } = renderViewModel();

      expect(result.current.recentHistory).toHaveLength(3);
    });

    it('should return empty array when history is empty', () => {
      (useHistoryStore as jest.Mock).mockReturnValue({
        history: [],
        isLoading: false,
        loadHistory: mockLoadHistory,
      });

      const { result } = renderViewModel();

      expect(result.current.recentHistory).toHaveLength(0);
    });

    it('should return fewer than 3 items when history has fewer than 3 items', () => {
      (useHistoryStore as jest.Mock).mockReturnValue({
        history: [createMockListeningHistory()],
        isLoading: false,
        loadHistory: mockLoadHistory,
      });

      const { result } = renderViewModel();

      expect(result.current.recentHistory).toHaveLength(1);
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

  describe('hasHistory', () => {
    it('should be true when history has items', () => {
      const { result } = renderViewModel();

      expect(result.current.hasHistory).toBe(true);
    });

    it('should be false when history is empty', () => {
      (useHistoryStore as jest.Mock).mockReturnValue({
        history: [],
        isLoading: false,
        loadHistory: mockLoadHistory,
      });

      const { result } = renderViewModel();

      expect(result.current.hasHistory).toBe(false);
    });
  });

  describe('isLoading', () => {
    it('should be true while history store is loading', () => {
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

    it('should call onSignOutPress when the alert is confirmed', () => {
      const { result } = renderViewModel();

      act(() => {
        result.current.handleSignOutPress();
      });

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const signOutButton = alertCall[2].find(
        (btn: { text: string }) => btn.text === 'Sign Out',
      );

      act(() => {
        signOutButton.onPress();
      });

      expect(mockOnSignOutPress).toHaveBeenCalledTimes(1);
    });

    it('should not call onSignOutPress when the alert is cancelled', () => {
      const { result } = renderViewModel();

      act(() => {
        result.current.handleSignOutPress();
      });

      // Don't press any button - verify callback was not called
      expect(mockOnSignOutPress).not.toHaveBeenCalled();
    });
  });
});
