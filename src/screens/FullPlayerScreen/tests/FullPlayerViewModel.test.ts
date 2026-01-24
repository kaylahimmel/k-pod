import { renderHook, act } from '@testing-library/react-native';
import { useFullPlayerViewModel } from '../FullPlayerViewModel';
import { playerStore, queueStore, settingsStore } from '../../../stores';
import {
  createMockEpisode,
  createMockPodcast,
  createMockQueueItems,
} from '../../../__mocks__';

// Mock the stores
jest.mock('../../../stores', () => ({
  playerStore: jest.fn(),
  queueStore: jest.fn(),
  settingsStore: jest.fn(),
}));

describe('useFullPlayerViewModel', () => {
  const mockOnDismiss = jest.fn();
  const mockSetIsPlaying = jest.fn();
  const mockSetPosition = jest.fn();
  const mockSetSpeed = jest.fn();
  const mockAddToQueue = jest.fn();

  const mockEpisode = createMockEpisode({
    id: 'episode-1',
    title: 'Test Episode',
    duration: 3600,
  });

  const mockPodcast = createMockPodcast({
    id: 'podcast-1',
    title: 'Test Podcast',
    episodes: [mockEpisode],
  });

  const defaultPlayerState = {
    isPlaying: false,
    position: 0,
    duration: 3600,
    speed: 1 as const,
    setIsPlaying: mockSetIsPlaying,
    setPosition: mockSetPosition,
    setSpeed: mockSetSpeed,
  };

  const defaultQueueState = {
    queue: [],
    currentIndex: 0,
    addToQueue: mockAddToQueue,
  };

  const defaultSettingsState = {
    settings: {
      autoPlayNext: true,
      defaultSpeed: 1,
      downloadOnWiFi: true,
      skipForwardSeconds: 30,
      skipBackwardSeconds: 15,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (playerStore as unknown as jest.Mock).mockReturnValue(defaultPlayerState);
    (queueStore as unknown as jest.Mock).mockReturnValue(defaultQueueState);
    (settingsStore as unknown as jest.Mock).mockReturnValue(
      defaultSettingsState,
    );
  });

  it('should return episode and podcast from props', () => {
    const { result } = renderHook(() =>
      useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
    );

    expect(result.current.episode).toBe(mockEpisode);
    expect(result.current.podcast).toBe(mockPodcast);
  });

  it('should return formatted playback time', () => {
    (playerStore as unknown as jest.Mock).mockReturnValue({
      ...defaultPlayerState,
      position: 60,
      duration: 300,
    });

    const { result } = renderHook(() =>
      useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
    );

    expect(result.current.playbackTime.current).toBe('1:00');
    expect(result.current.playbackTime.remaining).toBe('-4:00');
    expect(result.current.playbackTime.progress).toBe(0.2);
  });

  it('should return formatted speed display', () => {
    (playerStore as unknown as jest.Mock).mockReturnValue({
      ...defaultPlayerState,
      speed: 1.5,
    });

    const { result } = renderHook(() =>
      useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
    );

    expect(result.current.speedDisplay.label).toBe('1.5x');
    expect(result.current.speedDisplay.value).toBe(1.5);
  });

  it('should return hasUpNext false when no next item in queue', () => {
    const { result } = renderHook(() =>
      useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
    );

    expect(result.current.hasUpNext).toBe(false);
    expect(result.current.upNextItem).toBeNull();
  });

  it('should return upNextItem when there is a next item in queue', () => {
    const queueItems = createMockQueueItems(3);
    (queueStore as unknown as jest.Mock).mockReturnValue({
      ...defaultQueueState,
      queue: queueItems,
      currentIndex: 0,
    });

    const { result } = renderHook(() =>
      useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
    );

    expect(result.current.hasUpNext).toBe(true);
    expect(result.current.upNextItem).not.toBeNull();
    expect(result.current.upNextItem?.id).toBe(queueItems[1].id);
  });

  describe('handlePlayPause', () => {
    it('should toggle playing state from false to true', () => {
      const { result } = renderHook(() =>
        useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
      );

      act(() => {
        result.current.handlePlayPause();
      });

      expect(mockSetIsPlaying).toHaveBeenCalledWith(true);
    });

    it('should toggle playing state from true to false', () => {
      (playerStore as unknown as jest.Mock).mockReturnValue({
        ...defaultPlayerState,
        isPlaying: true,
      });

      const { result } = renderHook(() =>
        useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
      );

      act(() => {
        result.current.handlePlayPause();
      });

      expect(mockSetIsPlaying).toHaveBeenCalledWith(false);
    });
  });

  describe('handleSkipForward', () => {
    it('should skip forward by settings value', () => {
      (playerStore as unknown as jest.Mock).mockReturnValue({
        ...defaultPlayerState,
        position: 100,
        duration: 3600,
      });

      const { result } = renderHook(() =>
        useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
      );

      act(() => {
        result.current.handleSkipForward();
      });

      expect(mockSetPosition).toHaveBeenCalledWith(130); // 100 + 30
    });

    it('should not exceed duration when skipping forward', () => {
      (playerStore as unknown as jest.Mock).mockReturnValue({
        ...defaultPlayerState,
        position: 3590,
        duration: 3600,
      });

      const { result } = renderHook(() =>
        useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
      );

      act(() => {
        result.current.handleSkipForward();
      });

      expect(mockSetPosition).toHaveBeenCalledWith(3600);
    });
  });

  describe('handleSkipBackward', () => {
    it('should skip backward by settings value', () => {
      (playerStore as unknown as jest.Mock).mockReturnValue({
        ...defaultPlayerState,
        position: 100,
        duration: 3600,
      });

      const { result } = renderHook(() =>
        useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
      );

      act(() => {
        result.current.handleSkipBackward();
      });

      expect(mockSetPosition).toHaveBeenCalledWith(85); // 100 - 15
    });

    it('should not go below 0 when skipping backward', () => {
      (playerStore as unknown as jest.Mock).mockReturnValue({
        ...defaultPlayerState,
        position: 10,
        duration: 3600,
      });

      const { result } = renderHook(() =>
        useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
      );

      act(() => {
        result.current.handleSkipBackward();
      });

      expect(mockSetPosition).toHaveBeenCalledWith(0);
    });
  });

  describe('handleSeek', () => {
    it('should set position to given value', () => {
      const { result } = renderHook(() =>
        useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
      );

      act(() => {
        result.current.handleSeek(500);
      });

      expect(mockSetPosition).toHaveBeenCalledWith(500);
    });
  });

  describe('handleSpeedChange', () => {
    it('should set speed to given value', () => {
      const { result } = renderHook(() =>
        useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
      );

      act(() => {
        result.current.handleSpeedChange(1.5);
      });

      expect(mockSetSpeed).toHaveBeenCalledWith(1.5);
    });
  });

  describe('handleAddToQueue', () => {
    it('should add episode to queue with correct data', () => {
      const { result } = renderHook(() =>
        useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
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
    });

    it('should increment position based on queue length', () => {
      const queueItems = createMockQueueItems(3);
      (queueStore as unknown as jest.Mock).mockReturnValue({
        ...defaultQueueState,
        queue: queueItems,
      });

      const { result } = renderHook(() =>
        useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
      );

      act(() => {
        result.current.handleAddToQueue();
      });

      expect(mockAddToQueue).toHaveBeenCalledWith(
        expect.objectContaining({
          position: 3,
        }),
      );
    });
  });

  describe('handleDismiss', () => {
    it('should call onDismiss callback', () => {
      const { result } = renderHook(() =>
        useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
      );

      act(() => {
        result.current.handleDismiss();
      });

      expect(mockOnDismiss).toHaveBeenCalled();
    });
  });
});
