import { renderHook, act } from '@testing-library/react-native';
import { useFullPlayerViewModel } from '../FullPlayerViewModel';
import { restoreLastEpisode } from '../../../hooks/usePlaybackController';
import { playerStore, queueStore, settingsStore } from '../../../stores';
import { AudioPlayerService } from '../../../services';
import {
  createMockEpisode,
  createMockPodcast,
  createMockQueueItems,
} from '../../../__mocks__';

// Detailed playback control tests are in usePlaybackController.test.ts. These
// only check that the ViewModel's handlers reach the audio service.

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

  it('should return episode and podcast from props', async () => {
    const { result } = renderHook(() =>
      useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
    );
    // Flush async effects (e.g. playEpisode called in useEffect)
    await act(async () => {});

    expect(result.current.episode).toBe(mockEpisode);
    expect(result.current.podcast).toBe(mockPodcast);
  });

  it('should return empty upNextItem when queue is empty', async () => {
    const { result } = renderHook(() =>
      useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
    );
    await act(async () => {});

    expect(result.current.upNextItem).toBeNull();
    expect(result.current.hasUpNext).toBe(false);
  });

  it('should return upNextItem when there is a next item in queue', async () => {
    const mockQueue = createMockQueueItems(2);
    act(() => {
      queueStore.getState().setQueue(mockQueue);
      queueStore.getState().setCurrentIndex(0);
    });

    const { result } = renderHook(() =>
      useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
    );
    await act(async () => {});

    expect(result.current.hasUpNext).toBe(true);
    expect(result.current.upNextItem).toBeDefined();
  });

  it('should automatically add episode to queue when viewModel is created', async () => {
    renderHook(() =>
      useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
    );
    await act(async () => {});

    const queue = queueStore.getState().queue;
    expect(queue.length).toBe(1);
    expect(queue[0].episode.id).toBe(mockEpisode.id);
  });

  it('should not start audio when opened on an episode restored after a restart', async () => {
    const restoredItem = createMockQueueItems(1)[0];
    act(() => {
      queueStore.setState({ queue: [restoredItem], currentIndex: 0 });
    });
    await act(async () => {
      await restoreLastEpisode();
    });

    renderHook(() =>
      useFullPlayerViewModel(
        restoredItem.episode,
        restoredItem.podcast,
        mockOnDismiss,
      ),
    );
    await act(async () => {});

    expect(AudioPlayerService.play).not.toHaveBeenCalled();
  });

  describe('playback handlers', () => {
    const renderOpenPlayer = async () => {
      const view = renderHook(() =>
        useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
      );
      await act(async () => {});
      return view;
    };

    it('should pause through the audio service when playing', async () => {
      const { result } = await renderOpenPlayer();
      act(() => playerStore.getState().setIsPlaying(true));

      await act(async () => result.current.handlePlayPause());

      expect(AudioPlayerService.pause).toHaveBeenCalled();
    });

    it('should skip forward through the audio service', async () => {
      const { result } = await renderOpenPlayer();

      await act(async () => result.current.handleSkipForward());

      expect(AudioPlayerService.skipForward).toHaveBeenCalled();
    });

    it('should skip backward through the audio service', async () => {
      const { result } = await renderOpenPlayer();

      await act(async () => result.current.handleSkipBackward());

      expect(AudioPlayerService.skipBackward).toHaveBeenCalled();
    });

    it('should seek through the audio service', async () => {
      const { result } = await renderOpenPlayer();

      await act(async () => result.current.handleSeek(120));

      expect(AudioPlayerService.seek).toHaveBeenCalledWith(120);
    });

    it('should change speed through the audio service', async () => {
      const { result } = await renderOpenPlayer();

      await act(async () => result.current.handleSpeedChange(1.5));

      expect(AudioPlayerService.setPlaybackSpeed).toHaveBeenCalledWith(1.5);
    });
  });

  describe('handleDismiss and handleBack', () => {
    it('should call onDismiss when handleDismiss is called', async () => {
      const { result } = renderHook(() =>
        useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
      );
      await act(async () => {});

      act(() => {
        result.current.handleDismiss();
      });

      expect(mockOnDismiss).toHaveBeenCalled();
    });

    it('should call onDismiss when handleBack is called', async () => {
      const { result } = renderHook(() =>
        useFullPlayerViewModel(mockEpisode, mockPodcast, mockOnDismiss),
      );
      await act(async () => {});

      act(() => {
        result.current.handleBack();
      });

      expect(mockOnDismiss).toHaveBeenCalled();
    });
  });
});
