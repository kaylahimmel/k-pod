import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSearchResultsViewModel } from '../useSearchResultsViewModel';
import { DiscoveryService, RSSService } from '../../../services';
import { podcastStore } from '../../../stores';
import { Alert } from 'react-native';
import {
  createMockDiscoveryPodcast,
  createMockPodcast,
} from '../../../__mocks__';

// Mock the services
jest.mock('../../../services', () => ({
  DiscoveryService: {
    searchPodcasts: jest.fn(),
  },
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

describe('useSearchResultsViewModel', () => {
  const mockOnPodcastPress = jest.fn();
  const mockAddPodcast = jest.fn();

  const mockDiscoveryPodcast = createMockDiscoveryPodcast({
    id: 'discovery-1',
    title: 'Test Podcast',
    feedUrl: 'https://example.com/feed.xml',
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (podcastStore as unknown as jest.Mock).mockReturnValue({
      podcasts: [],
      addPodcast: mockAddPodcast,
    });
    (DiscoveryService.searchPodcasts as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockDiscoveryPodcast],
    });
  });

  it('should fetch search results on mount', async () => {
    const { result } = renderHook(() =>
      useSearchResultsViewModel('test query', mockOnPodcastPress),
    );

    // Initial loading state
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(DiscoveryService.searchPodcasts).toHaveBeenCalledWith({
      query: 'test query',
      limit: 25,
    });
    expect(result.current.results).toHaveLength(1);
    expect(result.current.formattedResults).toHaveLength(1);
  });

  it('should handle empty query', async () => {
    const { result } = renderHook(() =>
      useSearchResultsViewModel('', mockOnPodcastPress),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(DiscoveryService.searchPodcasts).not.toHaveBeenCalled();
    expect(result.current.results).toHaveLength(0);
  });

  it('should handle search error', async () => {
    (DiscoveryService.searchPodcasts as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Network error',
    });

    const { result } = renderHook(() =>
      useSearchResultsViewModel('test', mockOnPodcastPress),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasError).toBe(true);
    expect(result.current.error).toBe('Network error');
  });

  it('should return hasNoResults when results are empty', async () => {
    (DiscoveryService.searchPodcasts as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });

    const { result } = renderHook(() =>
      useSearchResultsViewModel('test', mockOnPodcastPress),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasNoResults).toBe(true);
  });

  it('should format results header correctly', async () => {
    const { result } = renderHook(() =>
      useSearchResultsViewModel('test query', mockOnPodcastPress),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.resultsHeader).toBe('1 result for "test query"');
  });

  describe('handleRetry', () => {
    it('should retry the search', async () => {
      (DiscoveryService.searchPodcasts as jest.Mock)
        .mockResolvedValueOnce({
          success: false,
          error: 'Network error',
        })
        .mockResolvedValueOnce({
          success: true,
          data: [mockDiscoveryPodcast],
        });

      const { result } = renderHook(() =>
        useSearchResultsViewModel('test', mockOnPodcastPress),
      );

      await waitFor(() => {
        expect(result.current.hasError).toBe(true);
      });

      await act(async () => {
        await result.current.handleRetry();
      });

      expect(result.current.hasError).toBe(false);
      expect(result.current.results).toHaveLength(1);
    });
  });

  describe('getOriginalPodcast', () => {
    it('should return podcast by id', async () => {
      const { result } = renderHook(() =>
        useSearchResultsViewModel('test', mockOnPodcastPress),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const podcast = result.current.getOriginalPodcast('discovery-1');
      expect(podcast).toEqual(mockDiscoveryPodcast);
    });

    it('should return undefined for unknown id', async () => {
      const { result } = renderHook(() =>
        useSearchResultsViewModel('test', mockOnPodcastPress),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const podcast = result.current.getOriginalPodcast('unknown-id');
      expect(podcast).toBeUndefined();
    });
  });

  describe('checkIsSubscribed', () => {
    it('should return true when podcast is subscribed', async () => {
      (podcastStore as unknown as jest.Mock).mockReturnValue({
        podcasts: [{ rssUrl: 'https://example.com/feed.xml' }],
        addPodcast: mockAddPodcast,
      });

      const { result } = renderHook(() =>
        useSearchResultsViewModel('test', mockOnPodcastPress),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(
        result.current.checkIsSubscribed('https://example.com/feed.xml'),
      ).toBe(true);
    });

    it('should return false when podcast is not subscribed', async () => {
      const { result } = renderHook(() =>
        useSearchResultsViewModel('test', mockOnPodcastPress),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(
        result.current.checkIsSubscribed('https://example.com/other.xml'),
      ).toBe(false);
    });
  });

  describe('handlePodcastPress', () => {
    it('should call onPodcastPress callback', async () => {
      const { result } = renderHook(() =>
        useSearchResultsViewModel('test', mockOnPodcastPress),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handlePodcastPress(mockDiscoveryPodcast);
      });

      expect(mockOnPodcastPress).toHaveBeenCalledWith(mockDiscoveryPodcast);
    });
  });

  describe('handleSubscribe', () => {
    it('should subscribe to podcast successfully', async () => {
      const mockRSSPodcast = createMockPodcast();
      (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
        success: true,
        data: mockRSSPodcast,
      });

      const { result } = renderHook(() =>
        useSearchResultsViewModel('test', mockOnPodcastPress),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.handleSubscribe(mockDiscoveryPodcast);
      });

      expect(RSSService.transformPodcastFromRSS).toHaveBeenCalledWith(
        'https://example.com/feed.xml',
      );
      expect(mockAddPodcast).toHaveBeenCalled();
    });

    it('should show alert on subscription failure', async () => {
      (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Failed to fetch RSS',
      });

      const { result } = renderHook(() =>
        useSearchResultsViewModel('test', mockOnPodcastPress),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.handleSubscribe(mockDiscoveryPodcast);
      });

      expect(mockAddPodcast).not.toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Subscription Failed',
        'Failed to fetch RSS',
      );
    });

    it('should handle unexpected errors', async () => {
      (RSSService.transformPodcastFromRSS as jest.Mock).mockRejectedValue(
        new Error('Unexpected error'),
      );

      const { result } = renderHook(() =>
        useSearchResultsViewModel('test', mockOnPodcastPress),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.handleSubscribe(mockDiscoveryPodcast);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Subscription Failed',
        'An unexpected error occurred',
      );
    });
  });
});
