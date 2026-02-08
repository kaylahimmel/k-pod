import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePlaybackController } from '../usePlaybackController';
import { AudioPlayerService } from '../../services/AudioPlayerService';
import { playerStore } from '../../stores/playerStore';
import { queueStore } from '../../stores/queueStore';
import { settingsStore } from '../../stores/settingsStore';
import {
  createMockEpisode,
  createMockPodcast,
  createMockQueueItem,
} from '../../__mocks__';

describe('usePlaybackController', () => {
  const mockEpisode = createMockEpisode({
    id: 'episode-1',
    title: 'Test Episode',
  });
  const mockPodcast = createMockPodcast({
    id: 'podcast-1',
    title: 'Test Podcast',
  });
  const mockEpisode2 = createMockEpisode({
    id: 'episode-2',
    title: 'Test Episode 2',
  });

  beforeEach(() => {
    // Reset stores
    act(() => {
      playerStore.getState().reset();
      queueStore.getState().clearQueue();
      settingsStore.getState().resetSettings();
    });

    // Reset all mocks
    jest.clearAllMocks();

    // Mock AudioPlayerService methods
    (AudioPlayerService.loadEpisode as jest.Mock).mockResolvedValue({
      success: true,
    });
    (AudioPlayerService.play as jest.Mock).mockResolvedValue({ success: true });
    (AudioPlayerService.pause as jest.Mock).mockResolvedValue({
      success: true,
    });
    (AudioPlayerService.seek as jest.Mock).mockResolvedValue({ success: true });
    (AudioPlayerService.setPlaybackSpeed as jest.Mock).mockResolvedValue({
      success: true,
    });
    (AudioPlayerService.skipForward as jest.Mock).mockResolvedValue({
      success: true,
    });
    (AudioPlayerService.skipBackward as jest.Mock).mockResolvedValue({
      success: true,
    });
    (AudioPlayerService.getStatus as jest.Mock).mockResolvedValue({
      success: true,
      data: { positionMillis: 30000 },
    });
    (AudioPlayerService.setOnProgress as jest.Mock).mockImplementation(
      () => {},
    );
    (AudioPlayerService.setOnEnd as jest.Mock).mockImplementation(() => {});
    (AudioPlayerService.setOnError as jest.Mock).mockImplementation(() => {});
  });

  describe('Initialization', () => {
    it('should set up AudioPlayerService callbacks on mount', () => {
      renderHook(() => usePlaybackController());

      expect(AudioPlayerService.setOnProgress).toHaveBeenCalled();
      expect(AudioPlayerService.setOnEnd).toHaveBeenCalled();
      expect(AudioPlayerService.setOnError).toHaveBeenCalled();
    });

    it('should clean up callbacks on unmount', () => {
      const { unmount } = renderHook(() => usePlaybackController());

      unmount();

      expect(AudioPlayerService.setOnProgress).toHaveBeenCalledWith(null);
      expect(AudioPlayerService.setOnEnd).toHaveBeenCalledWith(null);
      expect(AudioPlayerService.setOnError).toHaveBeenCalledWith(null);
    });
  });

  describe('playEpisode', () => {
    it('should load and play an episode', async () => {
      const { result } = renderHook(() => usePlaybackController());

      await act(async () => {
        await result.current.playEpisode(mockEpisode, mockPodcast);
      });

      await waitFor(() => {
        expect(AudioPlayerService.loadEpisode).toHaveBeenCalledWith(
          mockEpisode,
        );
        expect(AudioPlayerService.setPlaybackSpeed).toHaveBeenCalled();
        expect(AudioPlayerService.play).toHaveBeenCalled();
        expect(result.current.currentEpisode).toEqual(mockEpisode);
        expect(result.current.isPlaying).toBe(true);
      });
    });

    it('should update currentIndex if episode is in queue', async () => {
      const queueItem1 = createMockQueueItem({
        episode: mockEpisode,
        podcast: mockPodcast,
      });
      const queueItem2 = createMockQueueItem({
        episode: mockEpisode2,
        podcast: mockPodcast,
      });

      act(() => {
        queueStore.getState().setQueue([queueItem1, queueItem2]);
      });

      const { result } = renderHook(() => usePlaybackController());

      await act(async () => {
        await result.current.playEpisode(mockEpisode2, mockPodcast);
      });

      await waitFor(() => {
        expect(queueStore.getState().currentIndex).toBe(1);
      });
    });

    it('should handle load failure gracefully', async () => {
      (AudioPlayerService.loadEpisode as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Failed to load',
      });

      const { result } = renderHook(() => usePlaybackController());

      await act(async () => {
        await result.current.playEpisode(mockEpisode, mockPodcast);
      });

      // Should not attempt to play if load failed
      expect(AudioPlayerService.play).not.toHaveBeenCalled();
    });
  });

  describe('togglePlayPause', () => {
    it('should pause when playing', async () => {
      const { result } = renderHook(() => usePlaybackController());

      // Set up playing state
      await act(async () => {
        await result.current.playEpisode(mockEpisode, mockPodcast);
      });

      await act(async () => {
        await result.current.togglePlayPause();
      });

      await waitFor(() => {
        expect(AudioPlayerService.pause).toHaveBeenCalled();
        expect(result.current.isPlaying).toBe(false);
      });
    });

    it('should play when paused', async () => {
      const { result } = renderHook(() => usePlaybackController());

      // Set up episode and pause it
      await act(async () => {
        await result.current.playEpisode(mockEpisode, mockPodcast);
      });

      // Pause
      await act(async () => {
        await result.current.togglePlayPause();
      });

      await waitFor(() => {
        expect(result.current.isPlaying).toBe(false);
      });

      // Play again
      await act(async () => {
        await result.current.togglePlayPause();
      });

      await waitFor(() => {
        expect(result.current.isPlaying).toBe(true);
      });
    });

    it('should do nothing if no episode is loaded', async () => {
      const { result } = renderHook(() => usePlaybackController());

      await act(async () => {
        await result.current.togglePlayPause();
      });

      expect(AudioPlayerService.pause).not.toHaveBeenCalled();
      expect(AudioPlayerService.play).not.toHaveBeenCalled();
    });
  });

  describe('seek', () => {
    it('should seek to specified position', async () => {
      const { result } = renderHook(() => usePlaybackController());

      await act(async () => {
        await result.current.seek(120);
      });

      await waitFor(() => {
        expect(AudioPlayerService.seek).toHaveBeenCalledWith(120);
        expect(result.current.position).toBe(120);
      });
    });
  });

  describe('skipForward', () => {
    it('should skip forward by configured seconds', async () => {
      const { result } = renderHook(() => usePlaybackController());

      await act(async () => {
        await result.current.skipForward();
      });

      await waitFor(() => {
        expect(AudioPlayerService.skipForward).toHaveBeenCalledWith(30); // Default setting is 30
        expect(AudioPlayerService.getStatus).toHaveBeenCalled();
      });
    });
  });

  describe('skipBackward', () => {
    it('should skip backward by configured seconds', async () => {
      const { result } = renderHook(() => usePlaybackController());

      await act(async () => {
        await result.current.skipBackward();
      });

      await waitFor(() => {
        expect(AudioPlayerService.skipBackward).toHaveBeenCalledWith(15); // Default setting
        expect(AudioPlayerService.getStatus).toHaveBeenCalled();
      });
    });
  });

  describe('changeSpeed', () => {
    it('should change playback speed', async () => {
      const { result } = renderHook(() => usePlaybackController());

      await act(async () => {
        await result.current.changeSpeed(1.5);
      });

      await waitFor(() => {
        expect(AudioPlayerService.setPlaybackSpeed).toHaveBeenCalledWith(1.5);
        expect(result.current.speed).toBe(1.5);
      });
    });
  });

  describe('Queue navigation', () => {
    beforeEach(() => {
      const queueItem1 = createMockQueueItem({
        episode: mockEpisode,
        podcast: mockPodcast,
      });
      const queueItem2 = createMockQueueItem({
        episode: mockEpisode2,
        podcast: mockPodcast,
      });

      act(() => {
        queueStore.getState().setQueue([queueItem1, queueItem2]);
        queueStore.getState().setCurrentIndex(0);
      });
    });

    it('should play next episode in queue', async () => {
      const { result } = renderHook(() => usePlaybackController());

      expect(result.current.hasNext).toBe(true);

      await act(async () => {
        await result.current.playNext();
      });

      await waitFor(() => {
        expect(AudioPlayerService.loadEpisode).toHaveBeenCalledWith(
          mockEpisode2,
        );
      });
    });

    it('should play previous episode in queue', async () => {
      act(() => {
        queueStore.getState().setCurrentIndex(1);
      });

      const { result } = renderHook(() => usePlaybackController());

      expect(result.current.hasPrevious).toBe(true);

      await act(async () => {
        await result.current.playPrevious();
      });

      await waitFor(() => {
        expect(AudioPlayerService.loadEpisode).toHaveBeenCalledWith(
          mockEpisode,
        );
      });
    });

    it('should not play next if at end of queue', async () => {
      act(() => {
        queueStore.getState().setCurrentIndex(1);
      });

      const { result } = renderHook(() => usePlaybackController());

      expect(result.current.hasNext).toBe(false);

      await act(async () => {
        await result.current.playNext();
      });

      expect(AudioPlayerService.loadEpisode).not.toHaveBeenCalled();
    });

    it('should not play previous if at start of queue', async () => {
      const { result } = renderHook(() => usePlaybackController());

      expect(result.current.hasPrevious).toBe(false);

      await act(async () => {
        await result.current.playPrevious();
      });

      expect(AudioPlayerService.loadEpisode).not.toHaveBeenCalled();
    });
  });

  describe('Auto-advance', () => {
    it('should auto-advance to next episode when current episode ends', async () => {
      // Set up queue with two episodes
      const queueItem1 = createMockQueueItem({
        id: 'queue-item-1',
        episode: mockEpisode,
        podcast: mockPodcast,
      });
      const queueItem2 = createMockQueueItem({
        id: 'queue-item-2',
        episode: mockEpisode2,
        podcast: mockPodcast,
      });

      act(() => {
        queueStore.getState().setQueue([queueItem1, queueItem2]);
        queueStore.getState().setCurrentIndex(0);
        settingsStore.getState().updateSetting('autoPlayNext', true);
      });

      let onEndCallback: (() => void) | null = null;

      (AudioPlayerService.setOnEnd as jest.Mock).mockImplementation(
        (callback) => {
          onEndCallback = callback;
        },
      );

      renderHook(() => usePlaybackController());

      // Trigger the onEnd callback
      await act(async () => {
        if (onEndCallback) {
          onEndCallback();
        }
        // Wait for async operations
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        // After removing the completed episode, currentIndex should be 0 (pointing to what was previously index 1)
        expect(queueStore.getState().currentIndex).toBe(0);
        // Queue should have one less item (completed episode removed)
        expect(queueStore.getState().queue).toHaveLength(1);
        expect(AudioPlayerService.loadEpisode).toHaveBeenCalledWith(
          mockEpisode2,
        );
      });
    });

    it('should not auto-advance if autoPlayNext is disabled', async () => {
      const queueItem1 = createMockQueueItem({
        episode: mockEpisode,
        podcast: mockPodcast,
      });
      const queueItem2 = createMockQueueItem({
        episode: mockEpisode2,
        podcast: mockPodcast,
      });

      act(() => {
        queueStore.getState().setQueue([queueItem1, queueItem2]);
        queueStore.getState().setCurrentIndex(0);
        settingsStore.getState().updateSetting('autoPlayNext', false);
      });

      let onEndCallback: (() => void) | null = null;

      (AudioPlayerService.setOnEnd as jest.Mock).mockImplementation(
        (callback) => {
          onEndCallback = callback;
        },
      );

      renderHook(() => usePlaybackController());

      // Clear previous calls
      jest.clearAllMocks();

      // Trigger the onEnd callback
      await act(async () => {
        if (onEndCallback) {
          onEndCallback();
        }
      });

      // Should not load next episode
      expect(AudioPlayerService.loadEpisode).not.toHaveBeenCalled();
      expect(queueStore.getState().currentIndex).toBe(0);
    });

    it('should not auto-advance if at end of queue', async () => {
      const queueItem = createMockQueueItem({
        episode: mockEpisode,
        podcast: mockPodcast,
      });

      act(() => {
        queueStore.getState().setQueue([queueItem]);
        queueStore.getState().setCurrentIndex(0);
        settingsStore.getState().updateSetting('autoPlayNext', true);
      });

      let onEndCallback: (() => void) | null = null;

      (AudioPlayerService.setOnEnd as jest.Mock).mockImplementation(
        (callback) => {
          onEndCallback = callback;
        },
      );

      renderHook(() => usePlaybackController());

      // Clear previous calls
      jest.clearAllMocks();

      // Trigger the onEnd callback
      await act(async () => {
        if (onEndCallback) {
          onEndCallback();
        }
      });

      // Should not load next episode (no next episode)
      expect(AudioPlayerService.loadEpisode).not.toHaveBeenCalled();
      expect(queueStore.getState().currentIndex).toBe(0);
    });
  });

  describe('Progress callback', () => {
    it('should update position and duration on progress', () => {
      let onProgressCallback:
        | ((position: number, duration: number) => void)
        | null = null;

      (AudioPlayerService.setOnProgress as jest.Mock).mockImplementation(
        (callback) => {
          onProgressCallback = callback;
        },
      );

      renderHook(() => usePlaybackController());

      act(() => {
        if (onProgressCallback) {
          onProgressCallback(45, 180);
        }
      });

      expect(playerStore.getState().position).toBe(45);
      expect(playerStore.getState().duration).toBe(180);
    });
  });

  describe('Error callback', () => {
    it('should stop playback on error', () => {
      let onErrorCallback: ((error: string) => void) | null = null;

      (AudioPlayerService.setOnError as jest.Mock).mockImplementation(
        (callback) => {
          onErrorCallback = callback;
        },
      );

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      renderHook(() => usePlaybackController());

      // First play an episode
      act(() => {
        playerStore.getState().setIsPlaying(true);
      });

      act(() => {
        if (onErrorCallback) {
          onErrorCallback('Playback failed');
        }
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Playback error:',
        'Playback failed',
      );
      expect(playerStore.getState().isPlaying).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });
});
