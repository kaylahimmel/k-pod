import { useEffect, useCallback, useRef } from 'react';
import { usePlayerStore } from './usePlayerStore';
import { useQueueStore } from './useQueueStore';
import { useSettingsStore } from './useSettingsStore';
import { AudioPlayerService } from '../services/AudioPlayerService';
import { Episode, Podcast, PlaybackSpeed, QueueItem } from '../models';
import { queueStore } from '../stores';

/**
 * PlaybackController Hook
 * Manages integration between AudioPlayerService and app stores
 * Handles playback control, progress tracking, and auto-advance functionality
 */
export const usePlaybackController = () => {
  const {
    currentEpisode,
    currentPodcast,
    isPlaying,
    position,
    duration,
    speed,
    setCurrentEpisode,
    setCurrentPodcast,
    setIsPlaying,
    setPosition,
    setDuration,
    setSpeed,
  } = usePlayerStore();

  const { queue, currentIndex, setCurrentIndex, setQueue } = useQueueStore();

  const { settings } = useSettingsStore();

  // Track if we're currently loading an episode to prevent duplicate loads
  const isLoadingRef = useRef(false);

  /**
   * Progress callback: Update position and duration in store
   */
  const handleProgress = useCallback(
    (newPosition: number, newDuration: number) => {
      setPosition(newPosition);
      if (newDuration > 0 && newDuration !== duration) {
        setDuration(newDuration);
      }
    },
    [setPosition, setDuration, duration],
  );

  /**
   * End callback: Auto-advance to next episode in queue if enabled
   */
  const handleEnd = useCallback(() => {
    setIsPlaying(false);

    // Check if auto-play next is enabled
    if (!settings.autoPlayNext) {
      return;
    }

    // Check if there's a next item in the queue
    const nextIndex = currentIndex + 1;
    if (nextIndex < queue.length) {
      const nextItem = queue[nextIndex];
      setCurrentIndex(nextIndex);

      // Load and play the next episode
      const loadAndPlayNext = async () => {
        // Update player store immediately for instant UI feedback
        setCurrentEpisode(nextItem.episode);
        setCurrentPodcast(nextItem.podcast);
        setPosition(0);
        setDuration(0);

        // Load the episode (this may take several seconds)
        const loadResult = await AudioPlayerService.loadEpisode(
          nextItem.episode,
        );
        if (loadResult.success) {
          // Set playback speed
          await AudioPlayerService.setPlaybackSpeed(speed);

          // Start playback
          const playResult = await AudioPlayerService.play();
          if (playResult.success) {
            setIsPlaying(true);
          }
        }
      };

      loadAndPlayNext();
    }
  }, [
    settings.autoPlayNext,
    currentIndex,
    queue,
    setCurrentIndex,
    setCurrentEpisode,
    setCurrentPodcast,
    setPosition,
    setDuration,
    setIsPlaying,
    speed,
  ]);

  /**
   * Error callback: Handle playback errors
   */
  const handleError = useCallback(
    (error: string) => {
      console.error('Playback error:', error);
      setIsPlaying(false);
    },
    [setIsPlaying],
  );

  /**
   * Set up AudioPlayerService callbacks on mount
   */
  useEffect(() => {
    AudioPlayerService.setOnProgress(handleProgress);
    AudioPlayerService.setOnEnd(handleEnd);
    AudioPlayerService.setOnError(handleError);

    return () => {
      // Clean up callbacks on unmount
      AudioPlayerService.setOnProgress(null);
      AudioPlayerService.setOnEnd(null);
      AudioPlayerService.setOnError(null);
    };
  }, [handleProgress, handleEnd, handleError]);

  /**
   * Load and play an episode
   * If the episode is in the queue, update currentIndex
   * If not in queue, add it to the queue and play
   * Reads fresh queue state to avoid stale closure issues
   */
  const playEpisode = useCallback(
    async (episode: Episode, podcast: Podcast) => {
      if (isLoadingRef.current) return;

      // Check if this is a different episode than currently playing
      const isDifferentEpisode = currentEpisode?.id !== episode.id;

      // Get fresh queue state to avoid stale closure
      const { queue: freshQueue } = queueStore.getState();

      // If it's the same episode, just update podcast and ensure it's in queue
      if (!isDifferentEpisode) {
        setCurrentPodcast(podcast);

        // Check if this episode is in the queue
        const queueIndex = freshQueue.findIndex(
          (item) => item.episode.id === episode.id,
        );
        if (queueIndex !== -1) {
          setCurrentIndex(queueIndex);
        } else {
          // Add to queue at position 0 (beginning) if not already there
          const newQueueItem: QueueItem = {
            id: `${episode.id}-${Date.now()}`,
            episode,
            podcast,
            position: 0,
          };
          // Insert at the beginning of the queue using fresh queue
          setQueue([newQueueItem, ...freshQueue]);
          setCurrentIndex(0);
        }
        return; // Don't reload the same episode
      }

      isLoadingRef.current = true;

      try {
        // Update player store immediately for instant UI feedback
        setCurrentEpisode(episode);
        setCurrentPodcast(podcast);
        setPosition(0);
        setDuration(0);
        setIsPlaying(false); // Set to false while loading new episode

        // Get fresh queue state again in case it changed
        const { queue: currentQueue } = queueStore.getState();

        // Check if this episode is in the queue, add it if not
        let queueIndex = currentQueue.findIndex(
          (item) => item.episode.id === episode.id,
        );

        if (queueIndex === -1) {
          // Episode not in queue - add it at position 0 (beginning)
          const newQueueItem: QueueItem = {
            id: `${episode.id}-${Date.now()}`,
            episode,
            podcast,
            position: 0,
          };
          // Insert at the beginning of the queue using fresh queue
          setQueue([newQueueItem, ...currentQueue]);
          queueIndex = 0;
        }

        setCurrentIndex(queueIndex);

        // Load the episode (this may take several seconds)
        const loadResult = await AudioPlayerService.loadEpisode(episode);
        if (!loadResult.success) {
          console.error('Failed to load episode:', loadResult.error);
          return;
        }

        // Set playback speed
        await AudioPlayerService.setPlaybackSpeed(speed);

        // Start playback
        const playResult = await AudioPlayerService.play();
        if (playResult.success) {
          setIsPlaying(true);
        }
      } finally {
        isLoadingRef.current = false;
      }
    },
    [
      currentEpisode?.id,
      setCurrentIndex,
      setQueue,
      setCurrentEpisode,
      setCurrentPodcast,
      setPosition,
      setDuration,
      speed,
      setIsPlaying,
    ],
  );

  /**
   * Toggle play/pause
   */
  const togglePlayPause = useCallback(async () => {
    if (!currentEpisode) return;

    if (isPlaying) {
      const result = await AudioPlayerService.pause();
      if (result.success) {
        setIsPlaying(false);
      }
    } else {
      const result = await AudioPlayerService.play();
      if (result.success) {
        setIsPlaying(true);
      }
    }
  }, [currentEpisode, isPlaying, setIsPlaying]);

  /**
   * Seek to a specific position
   */
  const seek = useCallback(
    async (positionSeconds: number) => {
      const result = await AudioPlayerService.seek(positionSeconds);
      if (result.success) {
        setPosition(positionSeconds);
      }
    },
    [setPosition],
  );

  /**
   * Skip forward by configured seconds
   */
  const skipForward = useCallback(async () => {
    const result = await AudioPlayerService.skipForward(
      settings.skipForwardSeconds,
    );
    if (result.success) {
      const status = await AudioPlayerService.getStatus();
      if (status.success) {
        setPosition(status.data.positionMillis / 1000);
      }
    }
  }, [settings.skipForwardSeconds, setPosition]);

  /**
   * Skip backward by configured seconds
   */
  const skipBackward = useCallback(async () => {
    const result = await AudioPlayerService.skipBackward(
      settings.skipBackwardSeconds,
    );
    if (result.success) {
      const status = await AudioPlayerService.getStatus();
      if (status.success) {
        setPosition(status.data.positionMillis / 1000);
      }
    }
  }, [settings.skipBackwardSeconds, setPosition]);

  /**
   * Change playback speed
   */
  const changeSpeed = useCallback(
    async (newSpeed: PlaybackSpeed) => {
      const result = await AudioPlayerService.setPlaybackSpeed(newSpeed);
      if (result.success) {
        setSpeed(newSpeed);
      }
    },
    [setSpeed],
  );

  /**
   * Play the next episode in the queue
   */
  const playNext = useCallback(async () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < queue.length) {
      const nextItem = queue[nextIndex];
      await playEpisode(nextItem.episode, nextItem.podcast);
    }
  }, [currentIndex, queue, playEpisode]);

  /**
   * Play the previous episode in the queue
   */
  const playPrevious = useCallback(async () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      const prevItem = queue[prevIndex];
      await playEpisode(prevItem.episode, prevItem.podcast);
    }
  }, [currentIndex, queue, playEpisode]);

  /**
   * Play a specific queue item
   * Moves the item to the current playing position and plays it
   */
  const playQueueItem = useCallback(
    async (queueItem: QueueItem) => {
      if (isLoadingRef.current) return;

      // Find the index of this queue item in the current queue
      const itemIndex = queue.findIndex((item) => item.id === queueItem.id);

      if (itemIndex === -1) {
        // Item not found in queue, shouldn't happen but handle gracefully
        return;
      }

      // Check if this is a different episode than currently playing
      const isDifferentEpisode = currentEpisode?.id !== queueItem.episode.id;

      if (!isDifferentEpisode) {
        // Same episode - just ensure currentIndex is correct and reorder if needed
        if (itemIndex !== currentIndex) {
          // Move item to current position
          const newQueue = [...queue];
          const [movedItem] = newQueue.splice(itemIndex, 1);
          newQueue.splice(currentIndex, 0, movedItem);
          setQueue(newQueue);
        }
        setCurrentPodcast(queueItem.podcast);
        return;
      }

      isLoadingRef.current = true;

      try {
        // Reorder queue: move the selected item to the current playing position
        const newQueue = [...queue];
        const [movedItem] = newQueue.splice(itemIndex, 1);
        newQueue.splice(currentIndex, 0, movedItem);

        // Update queue with new order
        setQueue(newQueue);

        // currentIndex stays the same since we moved the item TO currentIndex

        // Update player store for instant UI feedback
        setCurrentEpisode(queueItem.episode);
        setCurrentPodcast(queueItem.podcast);
        setPosition(0);
        setDuration(0);
        setIsPlaying(false); // Set to false while loading

        // Load the episode
        const loadResult = await AudioPlayerService.loadEpisode(
          queueItem.episode,
        );
        if (!loadResult.success) {
          console.error('Failed to load episode:', loadResult.error);
          return;
        }

        // Set playback speed
        await AudioPlayerService.setPlaybackSpeed(speed);

        // Start playback
        const playResult = await AudioPlayerService.play();
        if (playResult.success) {
          setIsPlaying(true);
        }
      } finally {
        isLoadingRef.current = false;
      }
    },
    [
      queue,
      currentIndex,
      currentEpisode?.id,
      setQueue,
      setCurrentEpisode,
      setCurrentPodcast,
      setPosition,
      setDuration,
      setIsPlaying,
      speed,
    ],
  );

  /**
   * Stop current playback and play the next episode in the queue
   * Used when the currently playing episode needs to be removed (e.g., unsubscribe)
   * Note: After removeFromQueue adjusts currentIndex, it already points to the next item
   * This function reads fresh state from the store and directly loads/plays to avoid
   * stale closure values in other callbacks
   */
  const stopCurrentAndPlayNext = useCallback(async () => {
    // Stop current playback
    await AudioPlayerService.stop();

    // Get fresh queue state (not from closure) since removeFromQueue was just called
    const { queue: currentQueue, currentIndex: currentIdx } =
      queueStore.getState();

    // After removeFromQueue, currentIndex already points to the next item
    if (currentIdx < currentQueue.length) {
      const nextItem = currentQueue[currentIdx];

      // Update player store immediately for instant UI feedback
      setCurrentEpisode(nextItem.episode);
      setCurrentPodcast(nextItem.podcast);
      setPosition(0);
      setDuration(0);
      setIsPlaying(false);

      // Note: We don't call setCurrentIndex here because removeFromQueue already set it correctly

      // Load the episode
      const loadResult = await AudioPlayerService.loadEpisode(nextItem.episode);
      if (loadResult.success) {
        // Set playback speed
        await AudioPlayerService.setPlaybackSpeed(speed);

        // Start playback
        const playResult = await AudioPlayerService.play();
        if (playResult.success) {
          setIsPlaying(true);
        }
      }
    } else {
      // No next episode - reset player state
      setCurrentEpisode(null);
      setCurrentPodcast(null);
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
    }
  }, [
    speed,
    setCurrentEpisode,
    setCurrentPodcast,
    setIsPlaying,
    setPosition,
    setDuration,
  ]);

  return {
    // State
    currentEpisode,
    currentPodcast,
    isPlaying,
    position,
    duration,
    speed,

    // Actions
    playEpisode,
    togglePlayPause,
    seek,
    skipForward,
    skipBackward,
    changeSpeed,
    playNext,
    playPrevious,
    playQueueItem,
    stopCurrentAndPlayNext,

    // Queue info
    hasNext: currentIndex < queue.length - 1,
    hasPrevious: currentIndex > 0,
  };
};
