import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePodcastPreviewViewModel } from '../usePodcastPreviewViewModel';
import { RSSService } from '../../../services';
import { podcastStore, queueStore } from '../../../stores';
import { Alert } from 'react-native';
import {
  createMockDiscoveryPodcast,
  createMockPodcast,
} from '../../../__mocks__';

// Mock the services
jest.mock('../../../services', () => ({
  RSSService: {
    createPodcastFromDiscovery: jest.fn(),
    transformPodcastFromRSS: jest.fn(),
  },
}));

// Mock the stores
jest.mock('../../../stores', () => ({
  podcastStore: jest.fn(),
  queueStore: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('usePodcastPreviewViewModel', () => {
  const mockOnSubscribe = jest.fn();
  const mockOnEpisodePress = jest.fn();
  const mockOnPlayEpisode = jest.fn();
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
        mockOnPlayEpisode,
      ),
    );

  beforeEach(() => {
    jest.clearAllMocks();
    (podcastStore as unknown as jest.Mock).mockReturnValue({
      podcasts: [],
      addPodcast: mockAddPodcast,
    });
    (queueStore as unknown as jest.Mock).mockReturnValue({
      queue: [],
      addToQueue: jest.fn(),
      removeFromQueue: jest.fn(),
    });
    (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
      success: true,
      data: mockRSSPodcast,
    });
    (RSSService.createPodcastFromDiscovery as jest.Mock).mockResolvedValue({
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

    it('should hand the discovery record to the service and store its result', async () => {
      // Merging discovery metadata over the feed now lives in
      // RSSService.createPodcastFromDiscovery and is tested there
      const { result } = renderViewModel();

      await waitFor(() => {
        expect(result.current.isLoadingEpisodes).toBe(false);
      });

      await act(async () => {
        await result.current.handleSubscribe();
      });

      expect(RSSService.createPodcastFromDiscovery).toHaveBeenCalledWith(
        mockDiscoveryPodcast,
      );
      expect(mockAddPodcast).toHaveBeenCalledWith(mockRSSPodcast);
    });

    it('should show alert on subscription failure', async () => {
      (RSSService.createPodcastFromDiscovery as jest.Mock).mockResolvedValue({
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
      (RSSService.createPodcastFromDiscovery as jest.Mock).mockRejectedValue(
        new Error('Unexpected error'),
      );

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

      // Mount fetches episodes via transformPodcastFromRSS; the subscribe
      // service must not be touched at all when already subscribed
      expect(RSSService.createPodcastFromDiscovery).not.toHaveBeenCalled();
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
