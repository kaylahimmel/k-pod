import {
  AudioPlayer,
  AudioStatus,
  createAudioPlayer,
  setAudioModeAsync,
} from 'expo-audio';
import {
  PlaybackSpeed,
  PlaybackStatus,
  OnEndCallback,
  OnErrorCallback,
  OnProgressCallback,
  ServiceResult,
  Episode,
} from '../models';

// ============================================
// SINGLETON STATE
// ============================================
let playerInstance: AudioPlayer | null = null;
let statusSubscription: { remove: () => void } | null = null;
let currentEpisodeId: string | null = null;
let isAudioModeConfigured = false;

// While a seek is in flight, expo-audio keeps emitting playbackStatusUpdate
// events with the pre-seek currentTime (and they can arrive after the seekTo
// promise resolves). Progress updates are dropped until the reported time
// catches up to this target, so the UI position can't jump backward
let pendingSeekTarget: number | null = null;
const SEEK_SETTLE_TOLERANCE_SECONDS = 3;

// Set to the landed position when a seek resolves and the service emits it
// directly (the event stream can lag seconds behind on streamed audio).
// Status events reporting a time behind this floor are older data arriving
// late and are dropped; the first event at/past the floor clears it
let seekSettleFloor: number | null = null;

// How close to the end counts as "finished" when play() decides whether to
// restart from the beginning
const REPLAY_THRESHOLD_SECONDS = 0.5;

// Event callbacks
let onProgressCallback: OnProgressCallback | null = null;
let onEndCallback: OnEndCallback | null = null;
let onErrorCallback: OnErrorCallback | null = null;

// ============================================
// HELPER FUNCTIONS
// ============================================
/**
 * Configure audio mode for background playback
 * This must be called before playing any audio
 */
async function configureAudioMode(): Promise<ServiceResult<void>> {
  if (isAudioModeConfigured) {
    return { success: true, data: undefined };
  }

  try {
    await setAudioModeAsync({
      shouldPlayInBackground: true,
      playsInSilentMode: true,
      // Lower other apps' audio instead of pausing it (matches the previous
      // expo-av shouldDuckAndroid behavior; applies to both platforms now)
      interruptionMode: 'duckOthers',
      shouldRouteThroughEarpiece: false,
    });
    isAudioModeConfigured = true;
    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Failed to configure audio mode: ${message}`,
    };
  }
}

/**
 * Handle playback status updates from expo-audio
 * Routes updates to appropriate callbacks
 *
 * Note: expo-audio's AudioStatus has no error field (unlike expo-av), so
 * playback errors surface through the load/command ServiceResults instead
 */
function handlePlaybackStatusUpdate(status: AudioStatus): void {
  if (!status.isLoaded) {
    return;
  }

  // Drop stale progress from before an in-flight seek landed (far from the
  // target) or from behind the already-emitted landed position (late events);
  // the first update that has caught up clears both guards
  const isStaleSeekUpdate =
    (pendingSeekTarget !== null &&
      Math.abs(status.currentTime - pendingSeekTarget) >
        SEEK_SETTLE_TOLERANCE_SECONDS) ||
    (seekSettleFloor !== null && status.currentTime < seekSettleFloor);

  if (!isStaleSeekUpdate) {
    pendingSeekTarget = null;
    seekSettleFloor = null;

    // Report progress (both values already in seconds)
    if (onProgressCallback) {
      onProgressCallback(status.currentTime, status.duration);
    }
  }

  // Check if playback finished (never dropped, even for stale updates)
  if (status.didJustFinish && onEndCallback) {
    onEndCallback();
  }
}

/**
 * Release the current player instance and clean up resources
 */
function unloadCurrentPlayer(): void {
  pendingSeekTarget = null;
  seekSettleFloor = null;
  if (statusSubscription) {
    statusSubscription.remove();
    statusSubscription = null;
  }
  if (playerInstance) {
    try {
      // remove() only deregisters the player natively; without an explicit
      // pause() the old audio keeps playing until garbage collection
      playerInstance.pause();
      playerInstance.remove();
    } catch {
      // Ignore removal errors - player may already be released
    }
    playerInstance = null;
    currentEpisodeId = null;
  }
}

// ============================================
// MAIN FUNCTIONS
// ============================================
/**
 * Load an episode for playback
 * Unloads any previously loaded episode
 */
async function loadEpisode(episode: Episode): Promise<ServiceResult<void>> {
  // Configure audio mode if not already done
  const modeResult = await configureAudioMode();
  if (!modeResult.success) {
    return modeResult;
  }

  // Unload any existing player
  unloadCurrentPlayer();

  try {
    const player = createAudioPlayer(
      { uri: episode.audioUrl },
      { updateInterval: 1000 },
    );
    statusSubscription = player.addListener(
      'playbackStatusUpdate',
      handlePlaybackStatusUpdate,
    );

    playerInstance = player;
    currentEpisodeId = episode.id;

    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Also notify the error listener so UI wired via setOnError reacts
    if (onErrorCallback) {
      onErrorCallback(message);
    }
    return { success: false, error: `Failed to load episode: ${message}` };
  }
}

/**
 * Start or resume playback
 * Restarts from the beginning if the episode already finished: expo-audio
 * parks the player at the end (unlike expo-av), where play() does nothing
 */
async function play(): Promise<ServiceResult<void>> {
  if (!playerInstance) {
    return { success: false, error: 'No episode loaded' };
  }

  try {
    const { currentTime, duration } = playerInstance;
    const isAtEnd =
      duration > 0 && currentTime >= duration - REPLAY_THRESHOLD_SECONDS;
    if (isAtEnd) {
      // Route through seek() so the settle guard covers the restart too
      await seek(0);
    }

    playerInstance.play();
    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to play: ${message}` };
  }
}

/**
 * Pause playback
 */
async function pause(): Promise<ServiceResult<void>> {
  if (!playerInstance) {
    return { success: false, error: 'No episode loaded' };
  }

  try {
    playerInstance.pause();
    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to pause: ${message}` };
  }
}

/**
 * Stop playback and reset position to beginning
 * expo-audio has no stop(), so this is pause + seek to 0
 */
async function stop(): Promise<ServiceResult<void>> {
  if (!playerInstance) {
    return { success: false, error: 'No episode loaded' };
  }

  try {
    playerInstance.pause();
    await playerInstance.seekTo(0, 0, 0);
    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to stop: ${message}` };
  }
}

/**
 * Skip forward by specified seconds
 */
async function skipForward(seconds: number = 15): Promise<ServiceResult<void>> {
  const status = await getStatus();
  if (status.success) {
    return seek(status.data.positionSeconds + seconds);
  }
  return { success: false, error: 'Failed to get current status' };
}

/**
 * Skip backward by specified seconds
 */
async function skipBackward(
  seconds: number = 15,
): Promise<ServiceResult<void>> {
  const status = await getStatus();
  if (status.success) {
    return seek(Math.max(status.data.positionSeconds - seconds, 0));
  }
  return { success: false, error: 'Failed to get current status' };
}

/**
 * Seek to a specific position in seconds
 */
async function seek(positionSeconds: number): Promise<ServiceResult<void>> {
  if (!playerInstance) {
    return { success: false, error: 'No episode loaded' };
  }

  try {
    // Seeks past the end land at the duration, so clamp the settle target
    const knownDuration = playerInstance.duration;
    pendingSeekTarget =
      knownDuration > 0
        ? Math.min(positionSeconds, knownDuration)
        : positionSeconds;

    // Zero tolerance forces a precise seek on iOS; the default is infinite
    // tolerance, which lands up to ~1s before the target and makes the UI
    // position bounce backward after a skip (tolerances are ignored on Android)
    await playerInstance.seekTo(positionSeconds, 0, 0);

    // Emit the landed position now rather than waiting for the event stream
    // (it can lag seconds behind on streamed audio), and record it as the
    // floor below which late-arriving status events are dropped
    if (playerInstance) {
      const landedPosition = playerInstance.currentTime;
      seekSettleFloor = landedPosition;
      if (onProgressCallback) {
        onProgressCallback(landedPosition, playerInstance.duration);
      }
    }
    return { success: true, data: undefined };
  } catch (error) {
    pendingSeekTarget = null;
    seekSettleFloor = null;
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to seek: ${message}` };
  }
}

/**
 * Set playback speed (0.5x to 2x)
 */
async function setPlaybackSpeed(
  speed: PlaybackSpeed,
): Promise<ServiceResult<void>> {
  if (!playerInstance) {
    return { success: false, error: 'No episode loaded' };
  }

  try {
    // 'high' pitch correction maintains natural voice pitch at different speeds
    playerInstance.setPlaybackRate(speed, 'high');
    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to set speed: ${message}` };
  }
}

/**
 * Get current playback status
 */
async function getStatus(): Promise<ServiceResult<PlaybackStatus>> {
  if (!playerInstance) {
    return { success: false, error: 'No episode loaded' };
  }

  try {
    if (!playerInstance.isLoaded) {
      return { success: false, error: 'Audio not loaded' };
    }
    return {
      success: true,
      data: {
        positionSeconds: playerInstance.currentTime,
        durationSeconds: playerInstance.duration,
        isPlaying: playerInstance.playing,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to get status: ${message}` };
  }
}

/**
 * Get the ID of the currently loaded episode
 */
function getCurrentEpisodeId(): string | null {
  return currentEpisodeId;
}

// ============================================
// EVENT LISTENER REGISTRATION
// ============================================
/**
 * Set callback for progress updates
 * Called approximately every second during playback
 */
function setOnProgress(callback: OnProgressCallback | null): void {
  onProgressCallback = callback;
}

/**
 * Set callback for when playback ends
 * Useful for auto-advancing to next episode in queue
 */
function setOnEnd(callback: OnEndCallback | null): void {
  onEndCallback = callback;
}

/**
 * Set callback for playback errors
 * Fires on load failures; expo-audio does not emit status-level errors
 */
function setOnError(callback: OnErrorCallback | null): void {
  onErrorCallback = callback;
}

// ============================================
// CLEANUP
// ============================================
/**
 * Unload audio and clean up all resources
 * Call when leaving the app or no longer need audio
 */
async function cleanup(): Promise<void> {
  unloadCurrentPlayer();
  onProgressCallback = null;
  onEndCallback = null;
  onErrorCallback = null;
}

// ============================================
// EXPORTS
// ============================================
export const AudioPlayerService = {
  // Core playback
  loadEpisode,
  play,
  pause,
  stop,
  seek,
  setPlaybackSpeed,
  skipForward,
  skipBackward,

  // Status
  getStatus,
  getCurrentEpisodeId,

  // Event listeners
  setOnProgress,
  setOnEnd,
  setOnError,

  // Cleanup
  cleanup,

  // Expose for testing
  _helpers: {
    configureAudioMode,
    unloadCurrentPlayer,
    resetAudioModeConfig: () => {
      isAudioModeConfigured = false;
    },
  },
};
