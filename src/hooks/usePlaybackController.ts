import { useEffect, useCallback, useRef } from 'react';
import { usePlayerStore } from './usePlayerStore';
import { useQueueStore } from './useQueueStore';
import { useSettingsStore } from './useSettingsStore';
import { useHistoryStore } from './useHistoryStore';
import { AudioPlayerService } from '../services/AudioPlayerService';
import { StorageService } from '../services';
import { Episode, Podcast, PlaybackSpeed, QueueItem } from '../models';
import { queueStore, playerStore } from '../stores';

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

  const { addToHistory } = useHistoryStore();

  // Track if we're currently loading an episode to prevent duplicate loads
  const isLoadingRef = useRef(false);

  // Track the last saved position to avoid saving too frequently
  const lastSavedPositionRef = useRef<number>(0);

  // Track the last position to detect completion threshold
  const lastPositionRef = useRef<number>(0);

  /**
   * Progress callback: Update position and duration in store
   * Also saves position periodically (every 10 seconds) to storage
   */
  const handleProgress = useCallback(
    (newPosition: number, newDuration: number) => {
      setPosition(newPosition);
      if (newDuration > 0 && newDuration !== duration) {
        setDuration(newDuration);
      }

      // Save position to storage every 10 seconds
      if (
        currentEpisode &&
        Math.abs(newPosition - lastSavedPositionRef.current) >= 10
      ) {
        lastSavedPositionRef.current = newPosition;
        StorageService.savePlaybackPosition(currentEpisode.id, newPosition);
      }

      // Track last position for completion detection
      lastPositionRef.current = newPosition;
    },
    [setPosition, setDuration, duration, currentEpisode],
  );

  /**
   * End callback: Auto-advance to next episode in queue if enabled
   * Also tracks completed episodes in listening history and removes them from queue
   */
  const handleEnd = useCallback(() => {
    setIsPlaying(false);

    // Track this episode as completed in history (100% completion)
    if (currentEpisode && currentPodcast && duration > 0) {
      const completionPercentage = 100;
      addToHistory(currentEpisode, currentPodcast, completionPercentage);

      // Clear saved playback position since episode is complete
      StorageService.removePlaybackPosition(currentEpisode.id);
    }

    // Get fresh queue state to avoid stale closure issues
    const {
      queue: freshQueue,
      currentIndex: freshCurrentIndex,
      removeFromQueue,
    } = queueStore.getState();

    // Get the completed item ID to remove it later
    const completedItemId = freshQueue[freshCurrentIndex]?.id;

    // Check if auto-play next is enabled
    if (!settings.autoPlayNext) {
      // Not auto-playing, but still remove the completed episode
      if (completedItemId) {
        removeFromQueue(completedItemId);
      }
      return;
    }

    // Check if there's a next item in the queue
    const nextIndex = freshCurrentIndex + 1;
    if (nextIndex < freshQueue.length) {
      const nextItem = freshQueue[nextIndex];

      // Load and play the next episode
      const loadAndPlayNext = async () => {
        // Update player store immediately for instant UI feedback
        setCurrentEpisode(nextItem.episode);
        setCurrentPodcast(nextItem.podcast);
        setPosition(0);
        setDuration(0);

        // Load the episode (this may take several seconds)
        // Note: loadEpisode handles unloading the previous sound
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

      // Start loading and playing the next episode
      loadAndPlayNext();

      // Remove the completed episode synchronously after starting the load
      // This ensures correct queue state and index management
      if (completedItemId) {
        removeFromQueue(completedItemId);
      }
    } else {
      // No next episode - just remove the completed one
      if (completedItemId) {
        removeFromQueue(completedItemId);
      }
    }
  }, [
    settings.autoPlayNext,
    currentEpisode,
    currentPodcast,
    duration,
    addToHistory,
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

      // Get fresh state to avoid stale closure issues
      const { queue: freshQueue } = queueStore.getState();
      const { currentEpisode: freshCurrentEpisode } = playerStore.getState();

      // Check if this is a different episode than currently playing
      const isDifferentEpisode = freshCurrentEpisode?.id !== episode.id;

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
        // Save the current episode's position before switching
        // Get fresh values from store to avoid stale closure
        const { currentEpisode: freshCurrentEpisode, position: freshPosition } =
          playerStore.getState();
        if (freshCurrentEpisode && freshPosition > 0) {
          await StorageService.savePlaybackPosition(
            freshCurrentEpisode.id,
            freshPosition,
          );
          lastSavedPositionRef.current = freshPosition;
        }

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

        // Check for saved playback position and resume from there
        const savedPosition = await StorageService.loadPlaybackPosition(
          episode.id,
        );
        if (savedPosition > 0) {
          await AudioPlayerService.seek(savedPosition);
          setPosition(savedPosition);
          lastSavedPositionRef.current = savedPosition;
          lastPositionRef.current = savedPosition;
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
   * Saves position when pausing
   */
  const togglePlayPause = useCallback(async () => {
    if (!currentEpisode) return;

    if (isPlaying) {
      const result = await AudioPlayerService.pause();
      if (result.success) {
        setIsPlaying(false);

        // Save current position on pause
        if (position > 0) {
          await StorageService.savePlaybackPosition(
            currentEpisode.id,
            position,
          );
          lastSavedPositionRef.current = position;

          // Track partially completed episodes (>90% listened) in history
          if (duration > 0 && currentPodcast) {
            const completionPercentage = (position / duration) * 100;
            if (completionPercentage >= 90) {
              await addToHistory(
                currentEpisode,
                currentPodcast,
                completionPercentage,
              );
              // Clear saved position since it's essentially complete
              await StorageService.removePlaybackPosition(currentEpisode.id);
            }
          }
        }
      }
    } else {
      const result = await AudioPlayerService.play();
      if (result.success) {
        setIsPlaying(true);
      }
    }
  }, [
    currentEpisode,
    currentPodcast,
    isPlaying,
    position,
    duration,
    setIsPlaying,
    addToHistory,
  ]);

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
    // Get fresh queue state to avoid stale closure
    const { queue: freshQueue, currentIndex: freshCurrentIndex } =
      queueStore.getState();
    const nextIndex = freshCurrentIndex + 1;
    if (nextIndex < freshQueue.length) {
      const nextItem = freshQueue[nextIndex];
      await playEpisode(nextItem.episode, nextItem.podcast);
    }
  }, [playEpisode]);

  /**
   * Play the previous episode in the queue
   */
  const playPrevious = useCallback(async () => {
    // Get fresh queue state to avoid stale closure
    const { queue: freshQueue, currentIndex: freshCurrentIndex } =
      queueStore.getState();
    const prevIndex = freshCurrentIndex - 1;
    if (prevIndex >= 0) {
      const prevItem = freshQueue[prevIndex];
      await playEpisode(prevItem.episode, prevItem.podcast);
    }
  }, [playEpisode]);

  /**
   * Play a specific queue item
   * Moves the item to the current playing position and plays it
   */
  const playQueueItem = useCallback(
    async (queueItem: QueueItem) => {
      if (isLoadingRef.current) return;

      // Get fresh state to avoid stale closure issues
      const { queue: freshQueue } = queueStore.getState();
      const { currentEpisode: freshCurrentEpisode, position: freshPosition } =
        playerStore.getState();

      // Find the index of this queue item in the current queue
      const itemIndex = freshQueue.findIndex(
        (item) => item.id === queueItem.id,
      );

      if (itemIndex === -1) {
        // Item not found in queue, shouldn't happen but handle gracefully
        return;
      }

      // Check if this is a different episode than currently playing
      const isDifferentEpisode =
        freshCurrentEpisode?.id !== queueItem.episode.id;

      if (!isDifferentEpisode) {
        // Same episode - just ensure it's at position 0
        if (itemIndex !== 0) {
          // Move item to position 0
          const newQueue = [...freshQueue];
          const [movedItem] = newQueue.splice(itemIndex, 1);
          newQueue.splice(0, 0, movedItem);
          setQueue(newQueue);
          setCurrentIndex(0);
        }
        setCurrentPodcast(queueItem.podcast);
        return;
      }

      isLoadingRef.current = true;

      try {
        // Save the current episode's position before switching
        if (freshCurrentEpisode && freshPosition > 0) {
          await StorageService.savePlaybackPosition(
            freshCurrentEpisode.id,
            freshPosition,
          );
          lastSavedPositionRef.current = freshPosition;
        }

        // Reorder queue: move the tapped item to position 0 (blue card)
        // This places the previously playing item at position 1 (first white card)
        const newQueue = [...freshQueue];
        const [movedItem] = newQueue.splice(itemIndex, 1);
        newQueue.splice(0, 0, movedItem); // Always insert at index 0

        // Update queue and set currentIndex to 0 (currently playing position)
        setQueue(newQueue);
        setCurrentIndex(0);

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

        // Check for saved playback position and resume from there
        const savedPosition = await StorageService.loadPlaybackPosition(
          queueItem.episode.id,
        );
        if (savedPosition > 0) {
          await AudioPlayerService.seek(savedPosition);
          setPosition(savedPosition);
          lastSavedPositionRef.current = savedPosition;
          lastPositionRef.current = savedPosition;
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
      setQueue,
      setCurrentIndex,
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
        // Check for saved playback position and resume from there
        const savedPosition = await StorageService.loadPlaybackPosition(
          nextItem.episode.id,
        );
        if (savedPosition > 0) {
          await AudioPlayerService.seek(savedPosition);
          setPosition(savedPosition);
          lastSavedPositionRef.current = savedPosition;
          lastPositionRef.current = savedPosition;
        }

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
