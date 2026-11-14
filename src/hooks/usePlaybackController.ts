import { useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { usePlayerStore } from './usePlayerStore';
import { useQueueStore } from './useQueueStore';
import { useSettingsStore } from './useSettingsStore';
import { useHistoryStore } from './useHistoryStore';
import { AudioPlayerService } from '../services/AudioPlayerService';
import { StorageService } from '../services';
import { Episode, Podcast, PlaybackSpeed, QueueItem } from '../models';
import {
  queueStore,
  playerStore,
  settingsStore,
  podcastStore,
} from '../stores';
import { historyStore } from '../stores/historyStore';
import { ensureHydrated } from '../utils';
import { COMPLETION_THRESHOLD_PERCENT } from '../constants';

// ============================================
// SHARED PLAYBACK BOOKKEEPING
// ============================================
// AudioPlayerService is a singleton, so the state that coordinates with it
// must be shared too. These used to be per-instance refs, which silently
// diverged across the several screens that mount usePlaybackController

// Guards against concurrent episode loads from any screen
let isLoadingEpisode = false;

// Which load holds that guard. A cancelled load finishes later than the load
// that replaced it, and must not release the guard out from under it
let currentLoadClaim = 0;

// Whether the current load starts playback when it finishes. A load for a
// seek, skip or speed change doesn't, so a play tap during one is remembered
let loadStartsPlayback = false;
let playAfterLoad = false;

function claimLoad(startsPlayback = true): number {
  isLoadingEpisode = true;
  loadStartsPlayback = startsPlayback;
  playAfterLoad = false;
  return ++currentLoadClaim;
}

function releaseLoad(claim: number): void {
  if (claim === currentLoadClaim) {
    isLoadingEpisode = false;
  }
}

// Last position written to storage, to throttle saves to every ~10 seconds
let lastSavedPosition = 0;

// Bumped whenever a new load starts or the current one stops being wanted, so
// a load still awaiting something can tell it has been replaced
let loadGeneration = 0;

// Podcast audio reaches its file through redirects that can pick a different
// server on each request, so a server a network can't look up may work on the
// next try. Failures in a row retry this many times before the alert
const MAX_PLAYBACK_RETRIES = 2;
const PLAYBACK_RETRY_DELAY_MS = 1000;
let playbackRetryCount = 0;

const PLAYBACK_ERROR_MESSAGE =
  "This episode couldn't be played. Check your connection and try again.";

/**
 * The episode shown after a restart or a failed load, before any audio has loaded for it.
 * Compared against the player store so it stops applying by itself as soon
 * as a different episode becomes current.
 */
let restoredEpisodeId: string | null = null;

const isAwaitingLoad = () =>
  restoredEpisodeId !== null &&
  playerStore.getState().currentEpisode?.id === restoredEpisodeId;

/**
 * Loads an episode into the audio service and resumes its saved position,
 * without starting playback. Returns whether the episode loaded.
 */
async function loadAtSavedPosition(
  episode: Episode,
  podcast: Podcast,
): Promise<boolean> {
  const { setPosition } = playerStore.getState();
  const generation = ++loadGeneration;
  const wasReplaced = () => generation !== loadGeneration;

  // Note: loadEpisode handles unloading the previous player
  // The podcast is passed for lock screen / Control Center metadata
  const loadResult = await AudioPlayerService.loadEpisode(episode, podcast);
  if (wasReplaced()) {
    // A removal can finish while the player is being created. Nothing else
    // would release this one, so its audio would be left active
    if (AudioPlayerService.getCurrentEpisodeId() === episode.id) {
      AudioPlayerService.unload();
    }
    return false;
  }
  if (!loadResult.success) {
    console.error('Failed to load episode:', loadResult.error);
    Alert.alert('Playback Error', PLAYBACK_ERROR_MESSAGE);
    // No audio loaded, so the next play tap has to load it again
    restoredEpisodeId = episode.id;
    return false;
  }
  restoredEpisodeId = null;

  // Check for saved playback position and resume from there
  const savedPosition = await StorageService.loadPlaybackPosition(episode.id);
  if (wasReplaced()) return false;
  if (savedPosition > 0) {
    await AudioPlayerService.seek(savedPosition);
    if (wasReplaced()) return false;
    setPosition(savedPosition);
    lastSavedPosition = savedPosition;
  }

  // Set playback speed (fresh read - it may have changed since load began)
  await AudioPlayerService.setPlaybackSpeed(playerStore.getState().speed);
  return !wasReplaced();
}

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

  // This may take several seconds
  const loaded = await loadAtSavedPosition(episode, podcast);
  if (!loaded) return;

  // Start playback
  const playResult = await AudioPlayerService.play();
  if (playResult.success) {
    setIsPlaying(true);
  }
}

/**
 * Loads and plays an episode that has no audio loaded, holding the load guard
 * so play controls can't act on it halfway. Shared by every play control,
 * so they all recover from a restart or a failed load.
 */
async function startAwaitingEpisode(
  episode: Episode,
  podcast: Podcast,
): Promise<void> {
  if (isLoadingEpisode) return;
  const claim = claimLoad();
  try {
    await loadAndPlay(episode, podcast);
  } finally {
    releaseLoad(claim);
  }
}

/**
 * Tells any in-flight load it's no longer wanted, and returns the generation
 * to compare against after the caller's own awaits
 */
function cancelInFlightLoad(): number {
  isLoadingEpisode = false;
  return ++loadGeneration;
}

/**
 * Loads a restored episode so seek, skip and speed have a player to act on.
 * Does nothing for an episode that already loaded.
 */
async function ensureEpisodeLoaded(): Promise<void> {
  const { currentEpisode, currentPodcast } = playerStore.getState();
  if (!isAwaitingLoad() || isLoadingEpisode) return;
  if (!currentEpisode || !currentPodcast) return;

  const claim = claimLoad(false);
  try {
    const loaded = await loadAtSavedPosition(currentEpisode, currentPodcast);
    if (loaded && playAfterLoad) {
      const playResult = await AudioPlayerService.play();
      if (playResult.success) {
        playerStore.getState().setIsPlaying(true);
      }
    }
  } finally {
    releaseLoad(claim);
  }
}

/**
 * Shows the queue's current episode in the player after a restart, paused at
 * its saved position. The queue is persisted but the player isn't, so without
 * this the queue says "Now Playing" while the mini player is empty.
 * No audio loads here: that waits for the user's first tap.
 */
export async function restoreLastEpisode(): Promise<void> {
  await Promise.all([
    ensureHydrated(queueStore.persist),
    ensureHydrated(podcastStore.persist),
  ]);

  const { queue, currentIndex } = queueStore.getState();
  const item = queue[currentIndex];
  if (!item || playerStore.getState().currentEpisode) return;

  // Queue items are saved without their episode list, so prefer the
  // subscribed podcast, which has it
  const podcast =
    podcastStore.getState().podcasts.find((p) => p.id === item.podcast.id) ??
    item.podcast;
  const savedPosition = await StorageService.loadPlaybackPosition(
    item.episode.id,
  );

  // The user may have started an episode during the await above
  if (playerStore.getState().currentEpisode) return;

  showPaused(item.episode, podcast, savedPosition);
}

/**
 * Puts an episode in the player without loading audio, which waits for the
 * user's first tap
 */
function showPaused(
  episode: Episode,
  podcast: Podcast,
  position: number,
): void {
  const player = playerStore.getState();
  restoredEpisodeId = episode.id;
  player.setCurrentEpisode(episode);
  player.setCurrentPodcast(podcast);
  player.setIsPlaying(false);
  player.setPosition(position);
  player.setDuration(episode.duration);
}

/**
 * Empties the player without touching speed, which playerStore.reset() would
 * put back to 1x instead of the user's default
 */
function clearPlayer(): void {
  const player = playerStore.getState();
  player.setCurrentEpisode(null);
  player.setCurrentPodcast(null);
  player.setIsPlaying(false);
  player.setPosition(0);
  player.setDuration(0);
}

/**
 * Releases the current episode's audio, then saves its position so it can
 * resume if it's added back. Unloading comes first and uses unload(), not
 * stop(): a stopped player stays on the lock screen and still sends a late
 * position-0 event, which would overwrite the saved position.
 */
async function saveAndStopCurrent(): Promise<void> {
  const { currentEpisode, position } = playerStore.getState();
  AudioPlayerService.unload();
  if (currentEpisode && position > 0) {
    await StorageService.savePlaybackPosition(currentEpisode.id, position);
    lastSavedPosition = position;
  }
}

/**
 * Loads the episode again after a short wait. Cancels whatever load the failed
 * player was part of, and does nothing if the user moves on during the wait,
 * since anything that starts or removes an episode changes loadGeneration.
 */
function retryAfterDelay(episode: Episode, podcast: Podcast): void {
  const generation = cancelInFlightLoad();
  setTimeout(() => {
    if (generation === loadGeneration) {
      startAwaitingEpisode(episode, podcast);
    }
  }, PLAYBACK_RETRY_DELAY_MS);
}

/**
 * Moves the player to the queue's current item after an episode finishes with
 * nothing to auto-play, so the mini player matches the Now Playing card
 * instead of holding a finished episode that plays again on the next tap.
 * Audio stays unloaded until the first tap.
 */
async function showQueueCurrentPaused(): Promise<void> {
  const generation = cancelInFlightLoad();
  AudioPlayerService.unload();

  const { queue, currentIndex } = queueStore.getState();
  const item = queue[currentIndex];
  if (!item) {
    clearPlayer();
    return;
  }

  const savedPosition = await StorageService.loadPlaybackPosition(
    item.episode.id,
  );
  if (generation !== loadGeneration) return; // The user started something else
  showPaused(item.episode, item.podcast, savedPosition);
}

/**
 * PlaybackEvents hook
 * Registers the AudioPlayerService progress/end/error callbacks and routes
 * them into the stores (progress tracking, auto-advance, history).
 *
 * Mount this exactly ONCE at the app root (RootNavigator). Screens must use
 * usePlaybackController or usePlaybackActions - if a screen registered these callbacks,
 * its unmount would clear them for the whole app (last-writer-wins slots).
 */
export const usePlaybackEvents = () => {
  // Selectors, not whole stores: this hook is mounted in RootNavigator, so
  // reading the whole player store re-rendered the app root on every
  // position tick (once a second during playback). The actions never change,
  // and autoPlayNext only changes when the user flips it
  const setIsPlaying = playerStore((state) => state.setIsPlaying);
  const setPosition = playerStore((state) => state.setPosition);
  const setDuration = playerStore((state) => state.setDuration);
  const autoPlayNext = settingsStore((state) => state.settings.autoPlayNext);
  const addToHistory = historyStore((state) => state.addToHistory);

  /**
   * Progress callback: Update position and duration in store
   * Also saves position periodically (every 10 seconds) to storage
   */
  const handleProgress = useCallback(
    (newPosition: number, newDuration: number) => {
      setPosition(newPosition);

      // A failed player never reports a duration, so this one is working
      if (newDuration > 0) {
        playbackRetryCount = 0;
      }

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

      // Flag it on the podcast too. History and episode.played are separate
      // records of "completed" and both have to be written, or the Completed
      // screen and any played indicator stay empty while history fills up.
      podcastStore
        .getState()
        .markEpisodePlayed(freshPodcast.id, freshEpisode.id);

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
    if (!autoPlayNext) {
      // Not auto-playing, but still remove the completed episode
      if (completedItemId) {
        removeFromQueue(completedItemId);
      }
      showQueueCurrentPaused();
      return;
    }

    // Check if there's a next item in the queue
    const nextIndex = freshCurrentIndex + 1;
    if (nextIndex < freshQueue.length) {
      const nextItem = freshQueue[nextIndex];

      // Start loading and playing the next episode (shared path, so the
      // saved-position resume applies to auto-advance too)
      startAwaitingEpisode(nextItem.episode, nextItem.podcast);

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
      showQueueCurrentPaused();
    }
  }, [autoPlayNext, addToHistory, setIsPlaying]);

  /**
   * Error callback: Handle playback errors
   */
  const handleError = useCallback(
    (error: string) => {
      const { currentEpisode, currentPodcast, isPlaying } =
        playerStore.getState();
      // A failure can arrive before the load reaches setIsPlaying(true)
      const wantsPlayback =
        isPlaying || (isLoadingEpisode && loadStartsPlayback);

      setIsPlaying(false);
      // The player is dead, so the next play tap has to load it again
      restoredEpisodeId = currentEpisode?.id ?? null;

      if (
        currentEpisode &&
        currentPodcast &&
        wantsPlayback &&
        playbackRetryCount < MAX_PLAYBACK_RETRIES
      ) {
        playbackRetryCount++;
        retryAfterDelay(currentEpisode, currentPodcast);
        return;
      }

      playbackRetryCount = 0;
      console.error('Playback error:', error);
      Alert.alert('Playback Error', PLAYBACK_ERROR_MESSAGE);
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
   * Match the mini player to the persisted queue, once per app launch
   */
  useEffect(() => {
    restoreLastEpisode();
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
 * PlaybackActions Hook
 * The playback actions without the playback state. Use this on screens that
 * don't show live position: usePlaybackController re-renders its screen every
 * second during playback, which interrupts QueueScreen's drag and drop.
 */
export const usePlaybackActions = () => {
  // Read once instead of subscribing: store actions never change, and a
  // subscription would re-render the caller on every position update
  const { setCurrentPodcast, setIsPlaying, setPosition, setSpeed } =
    playerStore.getState();
  const { setCurrentIndex, setQueue, removeFromQueue, clearQueue } =
    queueStore.getState();

  const { settings } = useSettingsStore();

  const { addToHistory } = useHistoryStore();

  /**
   * Load and play an episode
   * If the episode is in the queue, update currentIndex
   * If not in queue, add it to the queue and play
   * Reads fresh queue state to avoid stale closure issues
   */
  const playEpisode = useCallback(
    async (episode: Episode, podcast: Podcast, startIfUnloaded = true) => {
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
        if (startIfUnloaded && isAwaitingLoad()) {
          await startAwaitingEpisode(episode, podcast);
        }
        return; // Don't reload the same episode
      }

      const claim = claimLoad();
      playbackRetryCount = 0;

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
        releaseLoad(claim);
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

    // Acting during a load could start the old player, or start the new one
    // before its saved position is applied. Most loads start playback when
    // they finish, and one for a seek or skip does it because of this flag
    if (isLoadingEpisode) {
      if (!loadStartsPlayback) playAfterLoad = true;
      return;
    }

    // A tap is a fresh attempt, with its own retries
    playbackRetryCount = 0;

    // First play after a restart: there's no audio loaded to resume yet
    if (isAwaitingLoad() && freshPodcast) {
      await startAwaitingEpisode(freshEpisode, freshPodcast);
      return;
    }

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

          // Count it as finished once it's past the completion threshold
          if (freshDuration > 0 && freshPodcast) {
            const completionPercentage = (freshPosition / freshDuration) * 100;
            if (completionPercentage >= COMPLETION_THRESHOLD_PERCENT) {
              await addToHistory(
                freshEpisode,
                freshPodcast,
                completionPercentage,
              );
              podcastStore
                .getState()
                .markEpisodePlayed(freshPodcast.id, freshEpisode.id);
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
      await ensureEpisodeLoaded();
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
    await ensureEpisodeLoaded();
    await AudioPlayerService.skipForward(settings.skipForwardSeconds);
  }, [settings.skipForwardSeconds]);

  /**
   * Skip backward by configured seconds
   * Position is not written here: the store position updates via the
   * service's status event stream once the seek lands (single writer)
   */
  const skipBackward = useCallback(async () => {
    await ensureEpisodeLoaded();
    await AudioPlayerService.skipBackward(settings.skipBackwardSeconds);
  }, [settings.skipBackwardSeconds]);

  /**
   * Change playback speed
   */
  const changeSpeed = useCallback(
    async (newSpeed: PlaybackSpeed) => {
      await ensureEpisodeLoaded();
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
        if (isAwaitingLoad()) {
          await startAwaitingEpisode(queueItem.episode, queueItem.podcast);
        }
        return;
      }

      const claim = claimLoad();
      playbackRetryCount = 0;

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
        releaseLoad(claim);
      }
    },
    [setQueue, setCurrentIndex, setCurrentPodcast],
  );

  /**
   * Remove an item from the queue. Removing the current episode also stops
   * its audio and moves to the next one, otherwise the old audio keeps playing
   * while the queue shows the next item as Now Playing.
   */
  const removeQueueItem = useCallback(
    async (itemId: string) => {
      const { queue: freshQueue } = queueStore.getState();
      const { currentEpisode: freshEpisode, isPlaying: wasPlaying } =
        playerStore.getState();
      const removedItem = freshQueue.find((item) => item.id === itemId);
      const isCurrent = removedItem?.episode.id === freshEpisode?.id;

      removeFromQueue(itemId);
      if (!removedItem || !isCurrent) return;

      const generation = cancelInFlightLoad();
      await saveAndStopCurrent();
      if (generation !== loadGeneration) return; // The user started something else

      // removeFromQueue already pointed currentIndex at the next item
      const { queue: nextQueue, currentIndex: nextIndex } =
        queueStore.getState();
      const nextItem = nextQueue[nextIndex];
      if (!nextItem) {
        clearPlayer();
        return;
      }

      if (wasPlaying) {
        await startAwaitingEpisode(nextItem.episode, nextItem.podcast);
      } else {
        const savedPosition = await StorageService.loadPlaybackPosition(
          nextItem.episode.id,
        );
        if (generation !== loadGeneration) return;
        showPaused(nextItem.episode, nextItem.podcast, savedPosition);
      }
    },
    [removeFromQueue],
  );

  /**
   * Empty the queue and stop whatever was playing from it
   */
  const clearQueueAndStop = useCallback(async () => {
    cancelInFlightLoad();
    clearQueue();
    await saveAndStopCurrent();
    clearPlayer();
  }, [clearQueue]);

  /**
   * Stop current playback and play the next episode in the queue
   * Used when the currently playing episode needs to be removed (e.g., unsubscribe)
   * Note: After removeFromQueue adjusts currentIndex, it already points to the next item
   * This function reads fresh state from the store and directly loads/plays to avoid
   * stale closure values in other callbacks
   */
  const stopCurrentAndPlayNext = useCallback(async () => {
    // A load still in flight would otherwise finish and start this episode
    cancelInFlightLoad();

    // Stop current playback
    AudioPlayerService.unload();

    // Get fresh queue state (not from closure) since removeFromQueue was just called
    const { queue: currentQueue, currentIndex: currentIdx } =
      queueStore.getState();

    // After removeFromQueue, currentIndex already points to the next item
    if (currentIdx < currentQueue.length) {
      const nextItem = currentQueue[currentIdx];

      // Note: We don't call setCurrentIndex here because removeFromQueue already set it correctly

      // Shared load path: optimistic store updates, load, resume from
      // saved position, apply speed, play
      await startAwaitingEpisode(nextItem.episode, nextItem.podcast);
    } else {
      // No next episode - reset player state
      clearPlayer();
    }
  }, []);

  return {
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
    removeQueueItem,
    clearQueueAndStop,
  };
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
  } = usePlayerStore();

  const { queue, currentIndex } = useQueueStore();

  const actions = usePlaybackActions();

  return {
    // State
    currentEpisode,
    currentPodcast,
    isPlaying,
    position,
    duration,
    speed,

    // Actions
    ...actions,

    // Queue info
    hasNext: currentIndex < queue.length - 1,
    hasPrevious: currentIndex > 0,
  };
};
