import { renderHook, act } from '@testing-library/react-native';
import { useFullPlayerViewModel } from '../FullPlayerViewModel';
import { playerStore, queueStore, settingsStore } from '../../../stores';
import {
  createMockEpisode,
  createMockPodcast,
  createMockQueueItems,
} from '../../../__mocks__';

// TO-DO: Update these tests to work with the new PlaybackController architecture
// For now, testing basic functionality. Detailed playback control tests are in usePlaybackController.test.ts

describe('useFullPlayerViewModel', () => {
  const mockOnDismiss = jest.fn();

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

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset stores to initial state
    act(() => {
      playerStore.getState().reset();
      queueStore.getState().clearQueue();
      settingsStore.getState().resetSettings();
    });
  });

  it('should return episode and podcast from props', () => {
    const { result } = renderHook(() =>
      useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
    );

    expect(result.current.episode).toBe(mockEpisode);
    expect(result.current.podcast).toBe(mockPodcast);
  });

  it('should return empty upNextItem when queue is empty', () => {
    const { result } = renderHook(() =>
      useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
    );

    expect(result.current.upNextItem).toBeNull();
    expect(result.current.hasUpNext).toBe(false);
  });

  it('should return upNextItem when there is a next item in queue', () => {
    const mockQueue = createMockQueueItems(2);
    act(() => {
      queueStore.getState().setQueue(mockQueue);
      queueStore.getState().setCurrentIndex(0);
    });

    const { result } = renderHook(() =>
      useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
    );

    expect(result.current.hasUpNext).toBe(true);
    expect(result.current.upNextItem).toBeDefined();
  });

  it('should automatically add episode to queue when viewModel is created', () => {
    const { result } = renderHook(() =>
      useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
    );

    // Episode should be automatically added to queue
    expect(result.current.isEpisodeInQueue).toBe(true);

    const queue = queueStore.getState().queue;
    expect(queue.length).toBe(1);
    expect(queue[0].episode.id).toBe(mockEpisode.id);
  });

  describe('handleAddToQueue', () => {
    it('should add episode to queue when manually called', () => {
      // Pre-set the episode in playerStore to avoid auto-add
      act(() => {
        playerStore.getState().setCurrentEpisode(mockEpisode);
        playerStore.getState().setCurrentPodcast(mockPodcast);
      });

      const { result } = renderHook(() =>
        useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
      );

      // Clear the queue to test manual add
      act(() => {
        queueStore.getState().clearQueue();
      });

      act(() => {
        result.current.handleAddToQueue();
      });

      const queue = queueStore.getState().queue;
      expect(queue.length).toBe(1);
      expect(queue[0].episode.id).toBe(mockEpisode.id);
    });
  });

  describe('handleDismiss and handleBack', () => {
    it('should call onDismiss when handleDismiss is called', () => {
      const { result } = renderHook(() =>
        useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
      );

      act(() => {
        result.current.handleDismiss();
      });

      expect(mockOnDismiss).toHaveBeenCalled();
    });

    it('should call onDismiss when handleBack is called', () => {
      const { result } = renderHook(() =>
        useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
      );

      act(() => {
        result.current.handleBack();
      });

      expect(mockOnDismiss).toHaveBeenCalled();
    });
  });
});
