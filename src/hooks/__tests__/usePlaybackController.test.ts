import { Alert } from 'react-native';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import {
  restoreLastEpisode,
  usePlaybackController,
  usePlaybackEvents,
} from '../usePlaybackController';
import { AudioPlayerService } from '../../services/AudioPlayerService';
import { StorageService } from '../../services';
import { playerStore } from '../../stores/playerStore';
import { queueStore } from '../../stores/queueStore';
import { settingsStore } from '../../stores/settingsStore';
import { podcastStore } from '../../stores/podcastStore';
import {
  createMockEpisode,
  createMockPodcast,
  createMockQueueItem,
} from '../../__mocks__';

type PlaybackActions = ReturnType<typeof usePlaybackController>;

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
      data: { positionSeconds: 30, durationSeconds: 3600, isPlaying: true },
    });
    (AudioPlayerService.setOnProgress as jest.Mock).mockImplementation(
      () => {},
    );
    (AudioPlayerService.setOnEnd as jest.Mock).mockImplementation(() => {});
    (AudioPlayerService.setOnError as jest.Mock).mockImplementation(() => {});
  });

  describe('Initialization', () => {
    // Callback registration lives in usePlaybackEvents (mounted once at the
    // app root). usePlaybackController is mounted by many screens at once,
    // so it must never touch the singleton's callback slots: a screen
    // unmounting used to null the callbacks and silently kill progress
    // updates, auto-advance, and history tracking for the whole app
    it('should register AudioPlayerService callbacks via usePlaybackEvents', () => {
      renderHook(() => usePlaybackEvents());

      expect(AudioPlayerService.setOnProgress).toHaveBeenCalledWith(
        expect.any(Function),
      );
      expect(AudioPlayerService.setOnEnd).toHaveBeenCalledWith(
        expect.any(Function),
      );
      expect(AudioPlayerService.setOnError).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it('should clean up callbacks when usePlaybackEvents unmounts', () => {
      const { unmount } = renderHook(() => usePlaybackEvents());

      unmount();

      expect(AudioPlayerService.setOnProgress).toHaveBeenCalledWith(null);
      expect(AudioPlayerService.setOnEnd).toHaveBeenCalledWith(null);
      expect(AudioPlayerService.setOnError).toHaveBeenCalledWith(null);
    });

    it('should not register or clear callbacks from usePlaybackController', () => {
      const { unmount } = renderHook(() => usePlaybackController());

      unmount();

      expect(AudioPlayerService.setOnProgress).not.toHaveBeenCalled();
      expect(AudioPlayerService.setOnEnd).not.toHaveBeenCalled();
      expect(AudioPlayerService.setOnError).not.toHaveBeenCalled();
    });

    it('should seed the session playback speed from settings.defaultSpeed', async () => {
      // defaultSpeed was configurable in Settings but nothing ever read it;
      // playback always started at playerStore's hardcoded 1x
      act(() => {
        settingsStore.getState().updateSetting('defaultSpeed', 1.5);
      });

      renderHook(() => usePlaybackEvents());

      await waitFor(() => {
        expect(playerStore.getState().speed).toBe(1.5);
      });
    });

    it('should keep callbacks registered when a screen controller unmounts', () => {
      // Simulates: app root registers events; FullPlayer opens (controller
      // instance) and closes again while playback continues
      renderHook(() => usePlaybackEvents());
      const screenController = renderHook(() => usePlaybackController());

      (AudioPlayerService.setOnProgress as jest.Mock).mockClear();
      (AudioPlayerService.setOnEnd as jest.Mock).mockClear();
      (AudioPlayerService.setOnError as jest.Mock).mockClear();

      screenController.unmount();

      expect(AudioPlayerService.setOnProgress).not.toHaveBeenCalledWith(null);
      expect(AudioPlayerService.setOnEnd).not.toHaveBeenCalledWith(null);
      expect(AudioPlayerService.setOnError).not.toHaveBeenCalledWith(null);
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
          // podcast is passed through for lock screen metadata
          expect.objectContaining({ id: expect.any(String) }),
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
      });
      // Position updates flow through the status event stream (single writer),
      // so the controller must not read back and write position after a skip
      expect(AudioPlayerService.getStatus).not.toHaveBeenCalled();
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
      });
      // Same single-writer contract as skipForward
      expect(AudioPlayerService.getStatus).not.toHaveBeenCalled();
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
          // podcast is passed through for lock screen metadata
          expect.objectContaining({ id: expect.any(String) }),
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
          // podcast is passed through for lock screen metadata
          expect.objectContaining({ id: expect.any(String) }),
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

      renderHook(() => usePlaybackEvents());

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
          // podcast is passed through for lock screen metadata
          expect.objectContaining({ id: expect.any(String) }),
        );
      });
    });

    it('should mark the finished episode as played on the podcast', async () => {
      // History and episode.played are separate records of "completed".
      // Only history was written, so the Completed screen stayed empty no
      // matter how many episodes the user finished.
      act(() => {
        podcastStore.setState({
          podcasts: [{ ...mockPodcast, episodes: [{ ...mockEpisode }] }],
        });
        playerStore.getState().setCurrentEpisode(mockEpisode);
        playerStore.getState().setCurrentPodcast(mockPodcast);
        playerStore.getState().setDuration(3600);
      });

      let onEndCallback: (() => void) | null = null;
      (AudioPlayerService.setOnEnd as jest.Mock).mockImplementation((cb) => {
        onEndCallback = cb;
      });

      renderHook(() => usePlaybackEvents());

      await act(async () => {
        if (onEndCallback) onEndCallback();
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      await waitFor(() => {
        const episode = podcastStore
          .getState()
          .podcasts.find((p) => p.id === mockPodcast.id)
          ?.episodes.find((e) => e.id === mockEpisode.id);
        expect(episode?.played).toBe(true);
      });
    });

    it('should resume a partially-listened episode when auto-advancing into it', async () => {
      // The auto-advance path used to skip the saved-position restore that
      // every manual play path does, restarting half-listened episodes at 0
      jest
        .spyOn(StorageService, 'loadPlaybackPosition')
        .mockResolvedValueOnce(120);

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
        settingsStore.getState().updateSetting('autoPlayNext', true);
      });

      let onEndCallback: (() => void) | null = null;
      (AudioPlayerService.setOnEnd as jest.Mock).mockImplementation(
        (callback) => {
          onEndCallback = callback;
        },
      );

      renderHook(() => usePlaybackEvents());

      await act(async () => {
        if (onEndCallback) {
          onEndCallback();
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(AudioPlayerService.seek).toHaveBeenCalledWith(120);
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

      renderHook(() => usePlaybackEvents());

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

      renderHook(() => usePlaybackEvents());

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

      renderHook(() => usePlaybackEvents());

      act(() => {
        if (onProgressCallback) {
          onProgressCallback(45, 180);
        }
      });

      expect(playerStore.getState().position).toBe(45);
      expect(playerStore.getState().duration).toBe(180);
    });
  });

  describe('Restoring the last episode after a restart', () => {
    const restoredEpisode = createMockEpisode({
      id: 'restored-episode',
      duration: 1800,
    });
    const savedPodcast = createMockPodcast({ id: 'podcast-1', episodes: [] });

    const restore = async (position = 95) => {
      jest
        .spyOn(StorageService, 'loadPlaybackPosition')
        .mockResolvedValue(position);
      act(() => {
        queueStore.setState({
          queue: [
            createMockQueueItem({
              id: 'item-1',
              episode: restoredEpisode,
              podcast: savedPodcast,
            }),
          ],
          currentIndex: 0,
        });
      });
      await act(async () => {
        await restoreLastEpisode();
      });
    };

    it('shows the current queue item paused at its saved position', async () => {
      await restore();

      const player = playerStore.getState();
      expect(player.currentEpisode?.id).toBe('restored-episode');
      expect(player.isPlaying).toBe(false);
      expect(player.position).toBe(95);
      expect(player.duration).toBe(1800);
      expect(AudioPlayerService.loadEpisode).not.toHaveBeenCalled();
    });

    it('leaves the player empty when the queue is empty', async () => {
      await act(async () => {
        await restoreLastEpisode();
      });

      expect(playerStore.getState().currentEpisode).toBeNull();
    });

    it('leaves the player empty when currentIndex is past the queue', async () => {
      act(() => {
        queueStore.setState({
          queue: [createMockQueueItem({ episode: restoredEpisode })],
          currentIndex: 4,
        });
      });

      await act(async () => {
        await restoreLastEpisode();
      });

      expect(playerStore.getState().currentEpisode).toBeNull();
    });

    it('prefers the subscribed podcast, since queue items save no episodes', async () => {
      const subscribed = createMockPodcast({
        id: 'podcast-1',
        episodes: [restoredEpisode],
      });
      act(() => {
        podcastStore.setState({ podcasts: [subscribed] });
      });

      await restore();

      expect(playerStore.getState().currentPodcast).toBe(subscribed);
      act(() => {
        podcastStore.setState({ podcasts: [] });
      });
    });

    it('does not replace an episode that is already loaded', async () => {
      act(() => {
        playerStore.getState().setCurrentEpisode(mockEpisode);
      });

      await restore();

      expect(playerStore.getState().currentEpisode?.id).toBe('episode-1');
    });

    it('loads and plays on the first play tap', async () => {
      await restore();
      const { result } = renderHook(() => usePlaybackController());

      await act(async () => {
        await result.current.togglePlayPause();
      });

      expect(AudioPlayerService.loadEpisode).toHaveBeenCalledWith(
        restoredEpisode,
        savedPodcast,
      );
      expect(AudioPlayerService.seek).toHaveBeenCalledWith(95);
      expect(AudioPlayerService.play).toHaveBeenCalledTimes(1);
      expect(playerStore.getState().isPlaying).toBe(true);
    });

    it('only loads once across two play taps', async () => {
      await restore();
      const { result } = renderHook(() => usePlaybackController());

      await act(async () => {
        await result.current.togglePlayPause();
      });
      await act(async () => {
        await result.current.togglePlayPause();
      });

      expect(AudioPlayerService.loadEpisode).toHaveBeenCalledTimes(1);
    });

    it.each([
      ['seek', (c: PlaybackActions) => c.seek(300)],
      ['skipForward', (c: PlaybackActions) => c.skipForward()],
      ['skipBackward', (c: PlaybackActions) => c.skipBackward()],
      ['changeSpeed', (c: PlaybackActions) => c.changeSpeed(1.5)],
    ])('loads without playing before %s', async (_name, action) => {
      await restore();
      const { result } = renderHook(() => usePlaybackController());

      await act(async () => {
        await action(result.current);
      });

      expect(AudioPlayerService.loadEpisode).toHaveBeenCalledTimes(1);
      expect(AudioPlayerService.play).not.toHaveBeenCalled();
    });
  });

  describe('Removing from the queue', () => {
    const firstItem = createMockQueueItem({
      id: 'item-1',
      episode: mockEpisode,
      podcast: mockPodcast,
    });
    const secondItem = createMockQueueItem({
      id: 'item-2',
      episode: mockEpisode2,
      podcast: mockPodcast,
    });

    const startWith = (isPlaying: boolean, queue = [firstItem, secondItem]) => {
      act(() => {
        queueStore.setState({ queue, currentIndex: 0 });
        const player = playerStore.getState();
        player.setCurrentEpisode(mockEpisode);
        player.setCurrentPodcast(mockPodcast);
        player.setIsPlaying(isPlaying);
        player.setPosition(120);
      });
    };

    beforeEach(() => {
      (AudioPlayerService.stop as jest.Mock).mockResolvedValue({
        success: true,
      });
      jest.spyOn(StorageService, 'savePlaybackPosition').mockResolvedValue();
      jest.spyOn(StorageService, 'loadPlaybackPosition').mockResolvedValue(0);
    });

    it('stops a playing episode and plays the next one', async () => {
      startWith(true);
      const { result } = renderHook(() => usePlaybackController());

      await act(async () => {
        await result.current.removeQueueItem('item-1');
      });

      expect(StorageService.savePlaybackPosition).toHaveBeenCalledWith(
        'episode-1',
        120,
      );
      expect(AudioPlayerService.stop).toHaveBeenCalled();
      expect(AudioPlayerService.loadEpisode).toHaveBeenCalledWith(
        mockEpisode2,
        mockPodcast,
      );
      expect(playerStore.getState().currentEpisode?.id).toBe('episode-2');
      expect(playerStore.getState().isPlaying).toBe(true);
    });

    it('shows the next episode paused when nothing was playing', async () => {
      startWith(false);
      const { result } = renderHook(() => usePlaybackController());

      await act(async () => {
        await result.current.removeQueueItem('item-1');
      });

      expect(AudioPlayerService.stop).toHaveBeenCalled();
      expect(AudioPlayerService.loadEpisode).not.toHaveBeenCalled();
      expect(playerStore.getState().currentEpisode?.id).toBe('episode-2');
      expect(playerStore.getState().isPlaying).toBe(false);

      await act(async () => {
        await result.current.togglePlayPause();
      });

      expect(AudioPlayerService.loadEpisode).toHaveBeenCalledWith(
        mockEpisode2,
        mockPodcast,
      );
    });

    it('resets the player when the last episode is removed', async () => {
      startWith(true, [firstItem]);
      const { result } = renderHook(() => usePlaybackController());

      await act(async () => {
        await result.current.removeQueueItem('item-1');
      });

      expect(AudioPlayerService.stop).toHaveBeenCalled();
      expect(playerStore.getState().currentEpisode).toBeNull();
      expect(playerStore.getState().isPlaying).toBe(false);
    });

    it('leaves playback alone when removing an upcoming episode', async () => {
      startWith(true);
      const { result } = renderHook(() => usePlaybackController());

      await act(async () => {
        await result.current.removeQueueItem('item-2');
      });

      expect(AudioPlayerService.stop).not.toHaveBeenCalled();
      expect(queueStore.getState().queue).toEqual([firstItem]);
      expect(playerStore.getState().currentEpisode?.id).toBe('episode-1');
    });

    it('stops playback and resets the player when the queue is cleared', async () => {
      startWith(true);
      const { result } = renderHook(() => usePlaybackController());

      await act(async () => {
        await result.current.clearQueueAndStop();
      });

      expect(StorageService.savePlaybackPosition).toHaveBeenCalledWith(
        'episode-1',
        120,
      );
      expect(AudioPlayerService.stop).toHaveBeenCalled();
      expect(queueStore.getState().queue).toEqual([]);
      expect(playerStore.getState().currentEpisode).toBeNull();
    });
  });

  describe('Playback error messages', () => {
    const failedLoad = { success: false, error: 'offline' };
    let alertSpy: jest.SpyInstance;

    beforeEach(() => {
      alertSpy = jest.spyOn(Alert, 'alert').mockImplementation();
      jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('shows an alert when an episode fails to load', async () => {
      (AudioPlayerService.loadEpisode as jest.Mock).mockResolvedValue(
        failedLoad,
      );
      const { result } = renderHook(() => usePlaybackController());

      await act(async () => {
        await result.current.playEpisode(mockEpisode, mockPodcast);
      });

      expect(alertSpy).toHaveBeenCalledWith(
        'Playback Error',
        "This episode couldn't be played. Check your connection and try again.",
      );
      expect(playerStore.getState().isPlaying).toBe(false);
    });

    it('shows an alert when audio fails during playback', () => {
      let onError: ((error: string) => void) | null = null;
      (AudioPlayerService.setOnError as jest.Mock).mockImplementation(
        (callback) => {
          onError = callback;
        },
      );
      renderHook(() => usePlaybackEvents());

      act(() => {
        onError?.('stream failed');
      });

      expect(alertSpy).toHaveBeenCalledTimes(1);
    });

    it('retries the load on the next play tap', async () => {
      (AudioPlayerService.loadEpisode as jest.Mock).mockResolvedValueOnce(
        failedLoad,
      );
      const { result } = renderHook(() => usePlaybackController());

      await act(async () => {
        await result.current.playEpisode(mockEpisode, mockPodcast);
      });
      await act(async () => {
        await result.current.togglePlayPause();
      });

      expect(AudioPlayerService.loadEpisode).toHaveBeenCalledTimes(2);
      expect(playerStore.getState().isPlaying).toBe(true);
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

      renderHook(() => usePlaybackEvents());

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
