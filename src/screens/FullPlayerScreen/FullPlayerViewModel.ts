import { useCallback, useMemo } from 'react';
import { usePlayerStore, useQueueStore, useSettingsStore } from '../../hooks';
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
  // Store connections
  const {
    isPlaying,
    position,
    duration,
    speed,
    setIsPlaying,
    setPosition,
    setSpeed,
  } = usePlayerStore();

  const { queue, currentIndex, addToQueue } = useQueueStore();
  const { settings } = useSettingsStore();

  // Formatted display data
  const playbackTime = useMemo(
    () => formatPlaybackTime(position, duration),
    [position, duration],
  );

  const speedDisplay = useMemo(() => formatSpeedDisplay(speed), [speed]);

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

  // Playback control handlers
  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  const handleSkipForward = useCallback(() => {
    const newPosition = Math.min(
      position + settings.skipForwardSeconds,
      duration,
    );
    setPosition(newPosition);
  }, [position, duration, settings.skipForwardSeconds, setPosition]);

  const handleSkipBackward = useCallback(() => {
    const newPosition = Math.max(position - settings.skipBackwardSeconds, 0);
    setPosition(newPosition);
  }, [position, settings.skipBackwardSeconds, setPosition]);

  const handleSeek = useCallback(
    (newPosition: number) => {
      setPosition(newPosition);
    },
    [setPosition],
  );

  const handleSpeedChange = useCallback(
    (newSpeed: PlaybackSpeed) => {
      setSpeed(newSpeed);
    },
    [setSpeed],
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
  }, [episode, podcast, queue.length, addToQueue]);

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
    isPlaying,
    position,
    duration,
    speed,
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
