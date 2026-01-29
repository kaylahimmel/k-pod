import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePodcastPreviewViewModel } from '../usePodcastPreviewViewModel';
import { RSSService } from '../../../services';
import { podcastStore } from '../../../stores';
import { Alert } from 'react-native';
import {
  createMockDiscoveryPodcast,
  createMockPodcast,
} from '../../../__mocks__';

// Mock the services
jest.mock('../../../services', () => ({
  RSSService: {
    transformPodcastFromRSS: jest.fn(),
  },
}));

// Mock the stores
jest.mock('../../../stores', () => ({
  podcastStore: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('usePodcastPreviewViewModel', () => {
  const mockOnSubscribe = jest.fn();
  const mockOnEpisodePress = jest.fn();
  const mockAddPodcast = jest.fn();

  const mockDiscoveryPodcast = createMockDiscoveryPodcast({
    id: 'discovery-1',
    title: 'Test Podcast',
    feedUrl: 'https://example.com/feed.xml',
    description: 'A test podcast',
  });

  const mockRSSPodcast = createMockPodcast({
    id: 'rss-1',
    episodes: [
      {
        id: 'ep-1',
        podcastId: 'rss-1',
        title: 'Episode 1',
        description: 'First episode',
        audioUrl: 'https://example.com/ep1.mp3',
        duration: 3600,
        publishDate: '2024-06-15T00:00:00Z',
        played: false,
      },
    ],
  });

  // Helper to render the hook with standard mocks
  const renderViewModel = () =>
    renderHook(() =>
      usePodcastPreviewViewModel(
        mockDiscoveryPodcast,
        mockOnSubscribe,
        mockOnEpisodePress,
      ),
    );

  beforeEach(() => {
    jest.clearAllMocks();
    (podcastStore as unknown as jest.Mock).mockReturnValue({
      podcasts: [],
      addPodcast: mockAddPodcast,
    });
    (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
      success: true,
      data: mockRSSPodcast,
    });
  });

  it('should fetch episodes on mount', async () => {
    const { result } = renderViewModel();

    // Initial loading state
    expect(result.current.isLoadingEpisodes).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingEpisodes).toBe(false);
    });

    expect(RSSService.transformPodcastFromRSS).toHaveBeenCalledWith(
      'https://example.com/feed.xml',
    );
    expect(result.current.episodes).toHaveLength(1);
    expect(result.current.formattedEpisodes).toHaveLength(1);
  });

  it('should handle episode fetch error', async () => {
    (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Failed to fetch RSS',
    });

    const { result } = renderViewModel();

    await waitFor(() => {
      expect(result.current.isLoadingEpisodes).toBe(false);
    });

    expect(result.current.hasEpisodeError).toBe(true);
    expect(result.current.episodeError).toBe('Failed to fetch RSS');
  });

  it('should return hasNoEpisodes when episodes are empty', async () => {
    (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
      success: true,
      data: { ...mockRSSPodcast, episodes: [] },
    });

    const { result } = renderViewModel();

    await waitFor(() => {
      expect(result.current.isLoadingEpisodes).toBe(false);
    });

    expect(result.current.hasNoEpisodes).toBe(true);
  });

  it('should format podcast preview correctly', async () => {
    const { result } = renderViewModel();

    await waitFor(() => {
      expect(result.current.isLoadingEpisodes).toBe(false);
    });

    expect(result.current.formattedPodcast.id).toBe('discovery-1');
    expect(result.current.formattedPodcast.title).toBe('Test Podcast');
  });

  describe('subscribeButtonState', () => {
    it('should show default state when not subscribed', async () => {
      const { result } = renderViewModel();

      await waitFor(() => {
        expect(result.current.isLoadingEpisodes).toBe(false);
      });

      expect(result.current.subscribeButtonState).toEqual({
        isDisabled: false,
        iconName: 'add',
        label: 'Subscribe',
        showSpinner: false,
        styleKeys: ['subscribeButton'],
      });
    });

    it('should show subscribed state when already subscribed', async () => {
      (podcastStore as unknown as jest.Mock).mockReturnValue({
        podcasts: [{ rssUrl: 'https://example.com/feed.xml' }],
        addPodcast: mockAddPodcast,
      });

      const { result } = renderViewModel();

      await waitFor(() => {
        expect(result.current.isLoadingEpisodes).toBe(false);
      });

      expect(result.current.subscribeButtonState).toEqual({
        isDisabled: true,
        iconName: 'checkmark',
        label: 'Subscribed',
        showSpinner: false,
        styleKeys: ['subscribeButton', 'subscribedButton'],
      });
    });
  });

  describe('handleRetryEpisodes', () => {
    it('should retry fetching episodes', async () => {
      (RSSService.transformPodcastFromRSS as jest.Mock)
        .mockResolvedValueOnce({
          success: false,
          error: 'Network error',
        })
        .mockResolvedValueOnce({
          success: true,
          data: mockRSSPodcast,
        });

      const { result } = renderViewModel();

      await waitFor(() => {
        expect(result.current.hasEpisodeError).toBe(true);
      });

      await act(async () => {
        await result.current.handleRetryEpisodes();
      });

      expect(result.current.hasEpisodeError).toBe(false);
      expect(result.current.episodes).toHaveLength(1);
    });
  });

  describe('handleSubscribe', () => {
    it('should subscribe to podcast successfully', async () => {
      const { result } = renderViewModel();

      await waitFor(() => {
        expect(result.current.isLoadingEpisodes).toBe(false);
      });

      await act(async () => {
        await result.current.handleSubscribe();
      });

      expect(mockAddPodcast).toHaveBeenCalled();
      expect(mockOnSubscribe).toHaveBeenCalled();
    });

    it('should preserve discovery metadata when subscribing', async () => {
      const { result } = renderViewModel();

      await waitFor(() => {
        expect(result.current.isLoadingEpisodes).toBe(false);
      });

      await act(async () => {
        await result.current.handleSubscribe();
      });

      const addedPodcast = mockAddPodcast.mock.calls[0][0];
      expect(addedPodcast.id).toBe('discovery-1');
      expect(addedPodcast.title).toBe('Test Podcast');
    });

    it('should show alert on subscription failure', async () => {
      (RSSService.transformPodcastFromRSS as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          data: mockRSSPodcast,
        })
        .mockResolvedValueOnce({
          success: false,
          error: 'Failed to subscribe',
        });

      const { result } = renderViewModel();

      await waitFor(() => {
        expect(result.current.isLoadingEpisodes).toBe(false);
      });

      await act(async () => {
        await result.current.handleSubscribe();
      });

      expect(mockAddPodcast).not.toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Subscription Failed',
        'Failed to subscribe',
      );
    });

    it('should handle unexpected errors', async () => {
      (RSSService.transformPodcastFromRSS as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          data: mockRSSPodcast,
        })
        .mockRejectedValueOnce(new Error('Unexpected error'));

      const { result } = renderViewModel();

      await waitFor(() => {
        expect(result.current.isLoadingEpisodes).toBe(false);
      });

      await act(async () => {
        await result.current.handleSubscribe();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Subscription Failed',
        'An unexpected error occurred',
      );
    });

    it('should not subscribe if already subscribed', async () => {
      (podcastStore as unknown as jest.Mock).mockReturnValue({
        podcasts: [{ rssUrl: 'https://example.com/feed.xml' }],
        addPodcast: mockAddPodcast,
      });

      const { result } = renderViewModel();

      await waitFor(() => {
        expect(result.current.isLoadingEpisodes).toBe(false);
      });

      await act(async () => {
        await result.current.handleSubscribe();
      });

      // transformPodcastFromRSS should only be called once (for fetching episodes on mount)
      expect(RSSService.transformPodcastFromRSS).toHaveBeenCalledTimes(1);
      expect(mockAddPodcast).not.toHaveBeenCalled();
    });
  });

  describe('toggleDescription', () => {
    it('should toggle showFullDescription state', async () => {
      const { result } = renderViewModel();

      await waitFor(() => {
        expect(result.current.isLoadingEpisodes).toBe(false);
      });

      expect(result.current.showFullDescription).toBe(false);

      act(() => {
        result.current.toggleDescription();
      });

      expect(result.current.showFullDescription).toBe(true);

      act(() => {
        result.current.toggleDescription();
      });

      expect(result.current.showFullDescription).toBe(false);
    });
  });
});
