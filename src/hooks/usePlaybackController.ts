import { useEffect, useCallback } from 'react';
import { usePlayerStore } from './usePlayerStore';
import { useQueueStore } from './useQueueStore';
import { useSettingsStore } from './useSettingsStore';
import { useHistoryStore } from './useHistoryStore';
import { AudioPlayerService } from '../services/AudioPlayerService';
import { StorageService } from '../services';
import { Episode, Podcast, PlaybackSpeed, QueueItem } from '../models';
import { queueStore, playerStore, settingsStore } from '../stores';

// ============================================
// SHARED PLAYBACK BOOKKEEPING
// ============================================
// AudioPlayerService is a singleton, so the state that coordinates with it
// must be shared too. These used to be per-instance refs, which silently
// diverged across the several screens that mount usePlaybackController

// Guards against concurrent episode loads from any screen
let isLoadingEpisode = false;

// Last position written to storage, to throttle saves to every ~10 seconds
let lastSavedPosition = 0;

/**
 * Shared load-and-start path used by every way an episode can begin playing
 * (direct play, queue tap, auto-advance, stop-and-play-next), so behavior
 * like saved-position resume can't diverge between entry points.
 * Callers own their queue bookkeeping and the concurrent-load guard.
 */
async function loadAndPlay(episode: Episode, podcast: Podcast): Promise<void> {
  const {
    setCurrentEpisode,
    setCurrentPodcast,
    setPosition,
    setDuration,
    setIsPlaying,
  } = playerStore.getState();

  // Update player store immediately for instant UI feedback
  setCurrentEpisode(episode);
  setCurrentPodcast(podcast);
  setPosition(0);
  setDuration(0);
  setIsPlaying(false); // false while the episode loads

  // Load the episode (this may take several seconds)
  // Note: loadEpisode handles unloading the previous player
  const loadResult = await AudioPlayerService.loadEpisode(episode);
  if (!loadResult.success) {
    console.error('Failed to load episode:', loadResult.error);
    return;
  }

  // Check for saved playback position and resume from there
  const savedPosition = await StorageService.loadPlaybackPosition(episode.id);
  if (savedPosition > 0) {
    await AudioPlayerService.seek(savedPosition);
    setPosition(savedPosition);
    lastSavedPosition = savedPosition;
  }

  // Set playback speed (fresh read - it may have changed since load began)
  await AudioPlayerService.setPlaybackSpeed(playerStore.getState().speed);

  // Start playback
  const playResult = await AudioPlayerService.play();
  if (playResult.success) {
    setIsPlaying(true);
  }
}

/**
 * PlaybackEvents hook
 * Registers the AudioPlayerService progress/end/error callbacks and routes
 * them into the stores (progress tracking, auto-advance, history).
 *
 * Mount this exactly ONCE at the app root (RootNavigator). Screens must use
 * usePlaybackController instead - if a screen registered these callbacks,
 * its unmount would clear them for the whole app (last-writer-wins slots).
 */
export const usePlaybackEvents = () => {
  const { setIsPlaying, setPosition, setDuration } = usePlayerStore();

  const { settings } = useSettingsStore();

  const { addToHistory } = useHistoryStore();

  /**
   * Progress callback: Update position and duration in store
   * Also saves position periodically (every 10 seconds) to storage
   */
  const handleProgress = useCallback(
    (newPosition: number, newDuration: number) => {
      setPosition(newPosition);

      // Get fresh duration to avoid stale closure
      const { duration: freshDuration, currentEpisode: freshEpisode } =
        playerStore.getState();

      if (newDuration > 0 && newDuration !== freshDuration) {
        setDuration(newDuration);
      }

      // Save position to storage every 10 seconds
      if (freshEpisode && Math.abs(newPosition - lastSavedPosition) >= 10) {
        lastSavedPosition = newPosition;
        StorageService.savePlaybackPosition(freshEpisode.id, newPosition);
      }
    },
    [setPosition, setDuration],
  );

  /**
   * End callback: Auto-advance to next episode in queue if enabled
   * Also tracks completed episodes in listening history and removes them from queue
   */
  const handleEnd = useCallback(() => {
    setIsPlaying(false);

    // Get fresh player state to avoid stale closure issues
    const {
      currentEpisode: freshEpisode,
      currentPodcast: freshPodcast,
      duration: freshDuration,
    } = playerStore.getState();

    // Track this episode as completed in history (100% completion)
    if (freshEpisode && freshPodcast && freshDuration > 0) {
      const completionPercentage = 100;
      addToHistory(freshEpisode, freshPodcast, completionPercentage);

      // Clear saved playback position since episode is complete
      StorageService.removePlaybackPosition(freshEpisode.id);
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

      // Start loading and playing the next episode (shared path, so the
      // saved-position resume applies to auto-advance too)
      loadAndPlay(nextItem.episode, nextItem.podcast);

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
  }, [settings.autoPlayNext, addToHistory, setIsPlaying]);

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
   * Seed the session playback speed from the persisted defaultSpeed setting
   * once the settings store has rehydrated (AsyncStorage is async, so the
   * value may not be available on first render)
   */
  useEffect(() => {
    const applyDefaultSpeed = () => {
      playerStore
        .getState()
        .setSpeed(settingsStore.getState().settings.defaultSpeed);
    };

    if (settingsStore.persist.hasHydrated()) {
      applyDefaultSpeed();
      return undefined;
    }
    return settingsStore.persist.onFinishHydration(applyDefaultSpeed);
  }, []);

  /**
   * Register AudioPlayerService callbacks (single owner: the app root)
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
};

/**
 * PlaybackController Hook
 * Exposes playback state and actions to screens. Safe to mount from any
 * number of screens at once: it does NOT own the AudioPlayerService
 * callbacks (see usePlaybackEvents, mounted once at the app root).
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

  /**
   * Load and play an episode
   * If the episode is in the queue, update currentIndex
   * If not in queue, add it to the queue and play
   * Reads fresh queue state to avoid stale closure issues
   */
  const playEpisode = useCallback(
    async (episode: Episode, podcast: Podcast) => {
      if (isLoadingEpisode) return;

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

      isLoadingEpisode = true;

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
          lastSavedPosition = freshPosition;
        }

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

        // Shared load path: optimistic store updates, load, resume from
        // saved position, apply speed, play
        await loadAndPlay(episode, podcast);
      } finally {
        isLoadingEpisode = false;
      }
    },
    [setCurrentIndex, setQueue, setCurrentPodcast],
  );

  /**
   * Toggle play/pause
   * Saves position when pausing
   */
  const togglePlayPause = useCallback(async () => {
    // Get fresh state to avoid stale closure issues
    const {
      currentEpisode: freshEpisode,
      currentPodcast: freshPodcast,
      isPlaying: freshIsPlaying,
      position: freshPosition,
      duration: freshDuration,
    } = playerStore.getState();

    if (!freshEpisode) return;

    if (freshIsPlaying) {
      const result = await AudioPlayerService.pause();
      if (result.success) {
        setIsPlaying(false);

        // Save current position on pause
        if (freshPosition > 0) {
          await StorageService.savePlaybackPosition(
            freshEpisode.id,
            freshPosition,
          );
          lastSavedPosition = freshPosition;

          // Track partially completed episodes (>90% listened) in history
          if (freshDuration > 0 && freshPodcast) {
            const completionPercentage = (freshPosition / freshDuration) * 100;
            if (completionPercentage >= 90) {
              await addToHistory(
                freshEpisode,
                freshPodcast,
                completionPercentage,
              );
              // Clear saved position since it's essentially complete
              await StorageService.removePlaybackPosition(freshEpisode.id);
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
  }, [setIsPlaying, addToHistory]);

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
   * Position is not written here: the store position updates via the
   * service's status event stream once the seek lands (single writer)
   */
  const skipForward = useCallback(async () => {
    await AudioPlayerService.skipForward(settings.skipForwardSeconds);
  }, [settings.skipForwardSeconds]);

  /**
   * Skip backward by configured seconds
   * Position is not written here: the store position updates via the
   * service's status event stream once the seek lands (single writer)
   */
  const skipBackward = useCallback(async () => {
    await AudioPlayerService.skipBackward(settings.skipBackwardSeconds);
  }, [settings.skipBackwardSeconds]);

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
      if (isLoadingEpisode) return;

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

      isLoadingEpisode = true;

      try {
        // Save the current episode's position before switching
        if (freshCurrentEpisode && freshPosition > 0) {
          await StorageService.savePlaybackPosition(
            freshCurrentEpisode.id,
            freshPosition,
          );
          lastSavedPosition = freshPosition;
        }

        // Reorder queue: move the tapped item to position 0 (blue card)
        // This places the previously playing item at position 1 (first white card)
        const newQueue = [...freshQueue];
        const [movedItem] = newQueue.splice(itemIndex, 1);
        newQueue.splice(0, 0, movedItem); // Always insert at index 0

        // Update queue and set currentIndex to 0 (currently playing position)
        setQueue(newQueue);
        setCurrentIndex(0);

        // Shared load path: optimistic store updates, load, resume from
        // saved position, apply speed, play
        await loadAndPlay(queueItem.episode, queueItem.podcast);
      } finally {
        isLoadingEpisode = false;
      }
    },
    [setQueue, setCurrentIndex, setCurrentPodcast],
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

      // Note: We don't call setCurrentIndex here because removeFromQueue already set it correctly

      // Shared load path: optimistic store updates, load, resume from
      // saved position, apply speed, play
      await loadAndPlay(nextItem.episode, nextItem.podcast);
    } else {
      // No next episode - reset player state
      setCurrentEpisode(null);
      setCurrentPodcast(null);
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
    }
  }, [
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
