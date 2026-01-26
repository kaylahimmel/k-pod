import { renderHook, act } from '@testing-library/react-native';
import { useAddPodcastViewModel } from '../AddPodcastViewModel';
import { RSSService } from '../../../services';
import { podcastStore } from '../../../stores';
import { createMockPodcast, createMockEpisode } from '../../../__mocks__';

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

describe('useAddPodcastViewModel', () => {
  const mockOnDismiss = jest.fn();
  const mockOnGoToDiscover = jest.fn();
  const mockAddPodcast = jest.fn();

  const mockPodcast = createMockPodcast({
    id: 'podcast-1',
    title: 'Test Podcast',
    author: 'Test Author',
    rssUrl: 'https://example.com/feed.xml',
    episodes: [
      createMockEpisode({
        id: 'ep-1',
        title: 'Episode 1',
      }),
    ],
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (podcastStore as unknown as jest.Mock).mockReturnValue({
      podcasts: [],
      addPodcast: mockAddPodcast,
    });
  });

  it('should initialize with idle state', () => {
    const { result } = renderHook(() =>
      useAddPodcastViewModel(mockOnDismiss, mockOnGoToDiscover),
    );

    expect(result.current.url).toBe('');
    expect(result.current.modalState).toBe('idle');
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.previewPodcast).toBeNull();
    expect(result.current.isAlreadySubscribed).toBe(false);
  });

  describe('handleUrlChange', () => {
    it('should update URL state', () => {
      const { result } = renderHook(() =>
        useAddPodcastViewModel(mockOnDismiss, mockOnGoToDiscover),
      );

      act(() => {
        result.current.handleUrlChange('https://example.com/feed.xml');
      });

      expect(result.current.url).toBe('https://example.com/feed.xml');
    });

    it('should clear error when typing starts', () => {
      const { result } = renderHook(() =>
        useAddPodcastViewModel(mockOnDismiss, mockOnGoToDiscover),
      );

      // Set up error state first
      act(() => {
        result.current.handleUrlChange('');
      });

      act(() => {
        result.current.handleFetchPodcast();
      });

      expect(result.current.modalState).toBe('error');

      // Start typing
      act(() => {
        result.current.handleUrlChange('h');
      });

      expect(result.current.errorMessage).toBeNull();
      expect(result.current.modalState).toBe('idle');
    });
  });

  describe('handleFetchPodcast', () => {
    it('should show error for empty URL', async () => {
      const { result } = renderHook(() =>
        useAddPodcastViewModel(mockOnDismiss, mockOnGoToDiscover),
      );

      await act(async () => {
        await result.current.handleFetchPodcast();
      });

      expect(result.current.modalState).toBe('error');
      expect(result.current.errorMessage).toBe('Please enter an RSS feed URL');
    });

    it('should show error for invalid URL', async () => {
      const { result } = renderHook(() =>
        useAddPodcastViewModel(mockOnDismiss, mockOnGoToDiscover),
      );

      act(() => {
        result.current.handleUrlChange('not-a-url');
      });

      await act(async () => {
        await result.current.handleFetchPodcast();
      });

      expect(result.current.modalState).toBe('error');
      expect(result.current.errorMessage).toBe('Please enter a valid URL');
    });

    it('should fetch podcast successfully', async () => {
      (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
        success: true,
        data: mockPodcast,
      });

      const { result } = renderHook(() =>
        useAddPodcastViewModel(mockOnDismiss, mockOnGoToDiscover),
      );

      act(() => {
        result.current.handleUrlChange('https://example.com/feed.xml');
      });

      await act(async () => {
        await result.current.handleFetchPodcast();
      });

      expect(result.current.modalState).toBe('preview');
      expect(result.current.previewPodcast).toEqual(mockPodcast);
      expect(RSSService.transformPodcastFromRSS).toHaveBeenCalledWith(
        'https://example.com/feed.xml',
      );
    });

    it('should show loading state while fetching', async () => {
      let resolvePromise: (value: unknown) => void;
      (RSSService.transformPodcastFromRSS as jest.Mock).mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
      );

      const { result } = renderHook(() =>
        useAddPodcastViewModel(mockOnDismiss, mockOnGoToDiscover),
      );

      act(() => {
        result.current.handleUrlChange('https://example.com/feed.xml');
      });

      // Start fetching but don't await
      act(() => {
        result.current.handleFetchPodcast();
      });

      expect(result.current.modalState).toBe('loading');

      // Resolve the promise
      await act(async () => {
        resolvePromise!({ success: true, data: mockPodcast });
      });

      expect(result.current.modalState).toBe('preview');
    });

    it('should handle fetch error', async () => {
      (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Invalid RSS feed: missing channel element',
      });

      const { result } = renderHook(() =>
        useAddPodcastViewModel(mockOnDismiss, mockOnGoToDiscover),
      );

      act(() => {
        result.current.handleUrlChange('https://example.com/feed.xml');
      });

      await act(async () => {
        await result.current.handleFetchPodcast();
      });

      expect(result.current.modalState).toBe('error');
      expect(result.current.errorMessage).toBe(
        'This URL does not appear to be a valid RSS feed',
      );
    });

    it('should trim URL before fetching', async () => {
      (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
        success: true,
        data: mockPodcast,
      });

      const { result } = renderHook(() =>
        useAddPodcastViewModel(mockOnDismiss, mockOnGoToDiscover),
      );

      act(() => {
        result.current.handleUrlChange('  https://example.com/feed.xml  ');
      });

      await act(async () => {
        await result.current.handleFetchPodcast();
      });

      expect(RSSService.transformPodcastFromRSS).toHaveBeenCalledWith(
        'https://example.com/feed.xml',
      );
    });
  });

  describe('handleSubscribe', () => {
    beforeEach(() => {
      (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
        success: true,
        data: mockPodcast,
      });
    });

    it('should add podcast to store and dismiss', async () => {
      const { result } = renderHook(() =>
        useAddPodcastViewModel(mockOnDismiss, mockOnGoToDiscover),
      );

      act(() => {
        result.current.handleUrlChange('https://example.com/feed.xml');
      });

      await act(async () => {
        await result.current.handleFetchPodcast();
      });

      act(() => {
        result.current.handleSubscribe();
      });

      expect(mockAddPodcast).toHaveBeenCalledWith(mockPodcast);
      expect(mockOnDismiss).toHaveBeenCalled();
    });

    it('should not subscribe if no preview podcast', () => {
      const { result } = renderHook(() =>
        useAddPodcastViewModel(mockOnDismiss, mockOnGoToDiscover),
      );

      act(() => {
        result.current.handleSubscribe();
      });

      expect(mockAddPodcast).not.toHaveBeenCalled();
      expect(mockOnDismiss).not.toHaveBeenCalled();
    });
  });

  describe('handleClearPreview', () => {
    it('should reset to idle state', async () => {
      (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
        success: true,
        data: mockPodcast,
      });

      const { result } = renderHook(() =>
        useAddPodcastViewModel(mockOnDismiss, mockOnGoToDiscover),
      );

      act(() => {
        result.current.handleUrlChange('https://example.com/feed.xml');
      });

      await act(async () => {
        await result.current.handleFetchPodcast();
      });

      expect(result.current.modalState).toBe('preview');

      act(() => {
        result.current.handleClearPreview();
      });

      expect(result.current.modalState).toBe('idle');
      expect(result.current.previewPodcast).toBeNull();
      expect(result.current.errorMessage).toBeNull();
    });
  });

  describe('handleDiscoverPodcastPress', () => {
    it('should call onGoToDiscover when pressed', () => {
      const { result } = renderHook(() =>
        useAddPodcastViewModel(mockOnDismiss, mockOnGoToDiscover),
      );

      act(() => {
        result.current.handleDiscoverPodcastPress();
      });

      expect(mockOnGoToDiscover).toHaveBeenCalled();
    });
  });

  describe('isAlreadySubscribed', () => {
    it('should return true when podcast is already subscribed', async () => {
      (podcastStore as unknown as jest.Mock).mockReturnValue({
        podcasts: [{ id: 'podcast-1', rssUrl: 'https://example.com/feed.xml' }],
        addPodcast: mockAddPodcast,
      });

      (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
        success: true,
        data: mockPodcast,
      });

      const { result } = renderHook(() =>
        useAddPodcastViewModel(mockOnDismiss, mockOnGoToDiscover),
      );

      act(() => {
        result.current.handleUrlChange('https://example.com/feed.xml');
      });

      await act(async () => {
        await result.current.handleFetchPodcast();
      });

      expect(result.current.isAlreadySubscribed).toBe(true);
    });

    it('should return false when podcast is not subscribed', async () => {
      (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
        success: true,
        data: mockPodcast,
      });

      const { result } = renderHook(() =>
        useAddPodcastViewModel(mockOnDismiss, mockOnGoToDiscover),
      );

      act(() => {
        result.current.handleUrlChange('https://example.com/feed.xml');
      });

      await act(async () => {
        await result.current.handleFetchPodcast();
      });

      expect(result.current.isAlreadySubscribed).toBe(false);
    });
  });
});
