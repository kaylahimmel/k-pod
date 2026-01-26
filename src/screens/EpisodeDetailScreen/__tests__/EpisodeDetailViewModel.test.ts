import { renderHook, act } from '@testing-library/react-native';
import { useEpisodeDetailViewModel } from '../EpisodeDetailViewModel';
import { createMockEpisode, createMockPodcast } from '../../../__mocks__';

// Mock variables must be prefixed with 'mock'
const mockShowToast = jest.fn();
const mockUsePodcastStore = jest.fn();
const mockUseQueueStore = jest.fn();

// Mock the hooks
jest.mock('../../../hooks', () => ({
  usePodcastStore: () => mockUsePodcastStore(),
  useQueueStore: () => mockUseQueueStore(),
  useToast: () => ({
    showToast: mockShowToast,
    message: '',
    visible: false,
    translateY: { value: 0 },
    opacity: { value: 0 },
    dismissToast: jest.fn(),
  }),
}));

describe('useEpisodeDetailViewModel', () => {
  const mockOnPlayEpisode = jest.fn();
  const mockOnGoBack = jest.fn();
  const mockAddToQueue = jest.fn();

  const mockEpisode = createMockEpisode({
    id: 'episode-1',
    podcastId: 'podcast-1',
    title: 'Test Episode',
  });

  const mockPodcast = createMockPodcast({
    id: 'podcast-1',
    title: 'Test Podcast',
    episodes: [mockEpisode],
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockShowToast.mockClear();
    mockUsePodcastStore.mockReturnValue({
      podcasts: [mockPodcast],
      loading: false,
    });
    mockUseQueueStore.mockReturnValue({
      queue: [],
      addToQueue: mockAddToQueue,
    });
  });

  it('should return formatted episode details', () => {
    const { result } = renderHook(() =>
      useEpisodeDetailViewModel(
        'episode-1',
        'podcast-1',
        mockOnPlayEpisode,
        mockOnGoBack,
      ),
    );

    expect(result.current.formattedEpisode).not.toBeNull();
    expect(result.current.formattedEpisode?.title).toBe('Test Episode');
    expect(result.current.formattedEpisode?.podcastTitle).toBe('Test Podcast');
  });

  it('should return null when episode not found', () => {
    const { result } = renderHook(() =>
      useEpisodeDetailViewModel(
        'non-existent-episode',
        'podcast-1',
        mockOnPlayEpisode,
        mockOnGoBack,
      ),
    );

    expect(result.current.formattedEpisode).toBeNull();
  });

  it('should return null when podcast not found', () => {
    const { result } = renderHook(() =>
      useEpisodeDetailViewModel(
        'episode-1',
        'non-existent-podcast',
        mockOnPlayEpisode,
        mockOnGoBack,
      ),
    );

    expect(result.current.formattedEpisode).toBeNull();
  });

  it('should return loading state', () => {
    mockUsePodcastStore.mockReturnValue({
      podcasts: [mockPodcast],
      loading: true,
    });

    const { result } = renderHook(() =>
      useEpisodeDetailViewModel(
        'episode-1',
        'podcast-1',
        mockOnPlayEpisode,
        mockOnGoBack,
      ),
    );

    expect(result.current.loading).toBe(true);
  });

  it('should return isInQueue false when episode not in queue', () => {
    const { result } = renderHook(() =>
      useEpisodeDetailViewModel(
        'episode-1',
        'podcast-1',
        mockOnPlayEpisode,
        mockOnGoBack,
      ),
    );

    expect(result.current.isInQueue).toBe(false);
  });

  it('should return isInQueue true when episode is in queue', () => {
    mockUseQueueStore.mockReturnValue({
      queue: [
        {
          id: 'queue-1',
          episode: mockEpisode,
          podcast: mockPodcast,
          position: 0,
        },
      ],
      addToQueue: mockAddToQueue,
    });

    const { result } = renderHook(() =>
      useEpisodeDetailViewModel(
        'episode-1',
        'podcast-1',
        mockOnPlayEpisode,
        mockOnGoBack,
      ),
    );

    expect(result.current.isInQueue).toBe(true);
  });

  describe('handlePlay', () => {
    it('should call onPlayEpisode with episode and podcast', () => {
      const { result } = renderHook(() =>
        useEpisodeDetailViewModel(
          'episode-1',
          'podcast-1',
          mockOnPlayEpisode,
          mockOnGoBack,
        ),
      );

      act(() => {
        result.current.handlePlay();
      });

      expect(mockOnPlayEpisode).toHaveBeenCalledWith(mockEpisode, mockPodcast);
    });

    it('should not call onPlayEpisode when episode not found', () => {
      const { result } = renderHook(() =>
        useEpisodeDetailViewModel(
          'non-existent',
          'podcast-1',
          mockOnPlayEpisode,
          mockOnGoBack,
        ),
      );

      act(() => {
        result.current.handlePlay();
      });

      expect(mockOnPlayEpisode).not.toHaveBeenCalled();
    });
  });

  describe('handleAddToQueue', () => {
    it('should add episode to queue', () => {
      const { result } = renderHook(() =>
        useEpisodeDetailViewModel(
          'episode-1',
          'podcast-1',
          mockOnPlayEpisode,
          mockOnGoBack,
        ),
      );

      act(() => {
        result.current.handleAddToQueue();
      });

      expect(mockAddToQueue).toHaveBeenCalledWith(
        expect.objectContaining({
          episode: mockEpisode,
          podcast: mockPodcast,
          position: 0,
        }),
      );
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining('Test Episode'),
      );
    });

    it('should show toast when episode already in queue', () => {
      mockUseQueueStore.mockReturnValue({
        queue: [
          {
            id: 'queue-1',
            episode: mockEpisode,
            podcast: mockPodcast,
            position: 0,
          },
        ],
        addToQueue: mockAddToQueue,
      });

      const { result } = renderHook(() =>
        useEpisodeDetailViewModel(
          'episode-1',
          'podcast-1',
          mockOnPlayEpisode,
          mockOnGoBack,
        ),
      );

      act(() => {
        result.current.handleAddToQueue();
      });

      expect(mockAddToQueue).not.toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith(
        'This episode is already in your queue',
      );
    });

    it('should not add when episode not found', () => {
      const { result } = renderHook(() =>
        useEpisodeDetailViewModel(
          'non-existent',
          'podcast-1',
          mockOnPlayEpisode,
          mockOnGoBack,
        ),
      );

      act(() => {
        result.current.handleAddToQueue();
      });

      expect(mockAddToQueue).not.toHaveBeenCalled();
    });
  });
});
