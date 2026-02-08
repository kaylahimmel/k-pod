import { useCallback, useMemo, useEffect } from 'react';
import {
  usePlaybackController,
  useQueueStore,
  useToast,
  usePlayerStore,
} from '../../hooks';
import { Episode, Podcast, PlaybackSpeed } from '../../models';
import {
  formatPlaybackTime,
  formatSpeedDisplay,
  formatUpNextItem,
  getNextQueueItem,
} from './FullPlayerPresenter';
import { FullPlayerViewModel } from './FullPlayer.types';

/**
 * ViewModel hook for the FullPlayer screen
 * Manages playback state, controls, and queue interactions
 */
export const useFullPlayerViewModel = (
  initialEpisode: Episode,
  initialPodcast: Podcast,
  onDismiss: () => void,
): FullPlayerViewModel => {
  // Playback controller for actions
  const playbackController = usePlaybackController();
  const { queue, currentIndex, addToQueue } = useQueueStore();
  const toast = useToast();
  // Get stable references from playerStore for proper re-renders
  const {
    currentEpisode: storeCurrentEpisode,
    currentPodcast: storeCurrentPodcast,
    position: storePosition,
    duration: storeDuration,
    isPlaying: storeIsPlaying,
    speed: storeSpeed,
  } = usePlayerStore();

  // Use the currently playing episode/podcast from the store
  // This ensures the screen updates when auto-advance happens
  // Memoize to ensure proper re-renders when currentEpisode changes
  const episode = useMemo(
    () => storeCurrentEpisode || initialEpisode,
    [storeCurrentEpisode, initialEpisode],
  );

  const podcast = useMemo(
    () => storeCurrentPodcast || initialPodcast,
    [storeCurrentPodcast, initialPodcast],
  );

  // Load and play the episode when the screen opens
  useEffect(() => {
    playbackController.playEpisode(initialEpisode, initialPodcast);
    // Only re-run when the initial episode ID changes (indicating a different episode was passed in)
    // We use initialEpisode.id instead of episode/podcast/playbackController because:
    // - `playbackController` is recreated on every render and would cause infinite loops
    // - `episode` and `podcast` objects may have same IDs but different references
    // - We only care about initialEpisode.id changing, which indicates a truly different episode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEpisode.id]);

  // Formatted display data - use store values for consistent updates
  const playbackTime = useMemo(
    () => formatPlaybackTime(storePosition, storeDuration),
    [storePosition, storeDuration],
  );

  const speedDisplay = useMemo(
    () => formatSpeedDisplay(storeSpeed),
    [storeSpeed],
  );

  // Get the next item in queue for "up next" preview
  const nextQueueItem = useMemo(
    () => getNextQueueItem(queue, currentIndex),
    [queue, currentIndex],
  );

  const upNextItem = useMemo(
    () => formatUpNextItem(nextQueueItem),
    [nextQueueItem],
  );

  const hasUpNext = upNextItem !== null;

  // Check if current episode is already in the queue
  const isEpisodeInQueue = useMemo(() => {
    return queue.some((item) => item.episode.id === episode.id);
  }, [queue, episode.id]);

  // Playback control handlers - delegate to PlaybackController
  const handlePlayPause = useCallback(() => {
    playbackController.togglePlayPause();
  }, [playbackController]);

  const handleSkipForward = useCallback(() => {
    playbackController.skipForward();
  }, [playbackController]);

  const handleSkipBackward = useCallback(() => {
    playbackController.skipBackward();
  }, [playbackController]);

  const handleSeek = useCallback(
    (newPosition: number) => {
      playbackController.seek(newPosition);
    },
    [playbackController],
  );

  const handleSpeedChange = useCallback(
    (newSpeed: PlaybackSpeed) => {
      playbackController.changeSpeed(newSpeed);
    },
    [playbackController],
  );

  // Add current episode to queue (at end)
  const handleAddToQueue = useCallback(() => {
    const queueItem = {
      id: `${episode.id}-${Date.now()}`,
      episode,
      podcast,
      position: queue.length,
    };
    addToQueue(queueItem);
    toast.showToast(`"${episode.title}" added to queue`);
  }, [episode, podcast, queue.length, addToQueue, toast]);

  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  // Back button navigates back (same as dismiss for modal)
  const handleBack = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  return {
    episode,
    podcast,
    playbackTime,
    speedDisplay,
    upNextItem,
    hasUpNext,
    isEpisodeInQueue,
    isPlaying: storeIsPlaying,
    position: storePosition,
    duration: storeDuration,
    speed: storeSpeed,
    handlePlayPause,
    handleSkipForward,
    handleSkipBackward,
    handleSeek,
    handleSpeedChange,
    handleAddToQueue,
    handleDismiss,
    handleBack,
  };
};
