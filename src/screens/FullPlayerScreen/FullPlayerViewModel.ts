import { useCallback, useMemo, useEffect } from 'react';
import { usePlaybackController, useQueueStore, useToast } from '../../hooks';
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
  episode: Episode,
  podcast: Podcast,
  onDismiss: () => void,
): FullPlayerViewModel => {
  // Playback controller
  const playbackController = usePlaybackController();
  const { queue, currentIndex, addToQueue } = useQueueStore();
  const toast = useToast();

  // Load and play the episode when the screen opens
  useEffect(() => {
    playbackController.playEpisode(episode, podcast);
    // Only re-run when the episode ID changes (indicating a different episode)
    // We use episode.id instead of episode/podcast/playbackController because:
    // - `playbackController` is recreated on every render and would cause infinite loops
    // - `episode` and `podcast` objects may have same IDs but different references
    // - We only care about episode.id changing, which indicates a truly different episode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episode.id]);

  // Formatted display data
  const playbackTime = useMemo(
    () =>
      formatPlaybackTime(
        playbackController.position,
        playbackController.duration,
      ),
    [playbackController.position, playbackController.duration],
  );

  const speedDisplay = useMemo(
    () => formatSpeedDisplay(playbackController.speed),
    [playbackController.speed],
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
    isPlaying: playbackController.isPlaying,
    position: playbackController.position,
    duration: playbackController.duration,
    speed: playbackController.speed,
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
