import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from "expo-av";
import {
  PlaybackSpeed,
  OnEndCallback,
  OnErrorCallback,
  OnProgressCallback,
  ServiceResult,
  Episode,
} from "../models";

// ============================================
// SINGLETON STATE
// ============================================
let soundInstance: Audio.Sound | null = null;
let currentEpisodeId: string | null = null;
let isAudioModeConfigured = false;

// Event callbacks
let onProgressCallback: OnProgressCallback | null = null;
let onEndCallback: OnEndCallback | null = null;
let onErrorCallback: OnErrorCallback | null = null;

// ============================================
// HELPER FUNCTIONS
// ============================================
/**
 * Type guard to check if playback status indicates successful load
 */
function isStatusSuccess(
  status: AVPlaybackStatus,
): status is AVPlaybackStatusSuccess {
  return status.isLoaded;
}

/**
 * Configure audio mode for background playback
 * This must be called before playing any audio
 */
async function configureAudioMode(): Promise<ServiceResult<void>> {
  if (isAudioModeConfigured) {
    return { success: true, data: undefined };
  }

  try {
    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    isAudioModeConfigured = true;
    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to configure audio mode: ${message}`,
    };
  }
}

/**
 * Handle playback status updates from expo-av
 * Routes updates to appropriate callbacks
 */
function handlePlaybackStatusUpdate(status: AVPlaybackStatus): void {
  if (!isStatusSuccess(status)) {
    // Handle error state
    if (status.error && onErrorCallback) {
      onErrorCallback(status.error);
    }
    return;
  }

  // Report progress
  if (onProgressCallback && status.positionMillis !== undefined) {
    const positionSeconds = status.positionMillis / 1000;
    const durationSeconds = (status.durationMillis ?? 0) / 1000;
    onProgressCallback(positionSeconds, durationSeconds);
  }

  // Check if playback finished
  if (status.didJustFinish && onEndCallback) {
    onEndCallback();
  }
}

/**
 * Unload the current sound instance and clean up resources
 */
async function unloadCurrentSound(): Promise<void> {
  if (soundInstance) {
    try {
      await soundInstance.unloadAsync();
    } catch {
      // Ignore unload errors - sound may already be unloaded
    }
    soundInstance = null;
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

  // Unload any existing sound
  await unloadCurrentSound();

  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: episode.audioUrl },
      { shouldPlay: false, progressUpdateIntervalMillis: 1000 },
      handlePlaybackStatusUpdate,
    );

    soundInstance = sound;
    currentEpisodeId = episode.id;

    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Failed to load episode: ${message}` };
  }
}

/**
 * Start or resume playback
 */
async function play(): Promise<ServiceResult<void>> {
  if (!soundInstance) {
    return { success: false, error: "No episode loaded" };
  }

  try {
    await soundInstance.playAsync();
    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Failed to play: ${message}` };
  }
}

/**
 * Pause playback
 */
async function pause(): Promise<ServiceResult<void>> {
  if (!soundInstance) {
    return { success: false, error: "No episode loaded" };
  }

  try {
    await soundInstance.pauseAsync();
    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Failed to pause: ${message}` };
  }
}

/**
 * Stop playback and reset position to beginning
 */
async function stop(): Promise<ServiceResult<void>> {
  if (!soundInstance) {
    return { success: false, error: "No episode loaded" };
  }

  try {
    await soundInstance.stopAsync();
    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Failed to stop: ${message}` };
  }
}

/**
 * Skip forward or backward by 15 seconds
 */
async function skipForward(seconds: number = 15) {
  const status = await getStatus();
  if (status.success) {
    const newPosition = status.data.positionMillis / 1000 + seconds;
    return seek(newPosition);
  }
}

async function skipBackward(seconds: number = 15) {
  const status = await getStatus();
  if (status.success) {
    const newPosition = Math.max(
      status.data.positionMillis / 1000 - seconds,
      0,
    );
    return seek(newPosition);
  }
}

/**
 * Seek to a specific position in seconds
 */
async function seek(positionSeconds: number): Promise<ServiceResult<void>> {
  if (!soundInstance) {
    return { success: false, error: "No episode loaded" };
  }

  try {
    const positionMillis = positionSeconds * 1000;
    await soundInstance.setPositionAsync(positionMillis);
    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Failed to seek: ${message}` };
  }
}

/**
 * Set playback speed (0.5x to 2x)
 */
async function setPlaybackSpeed(
  speed: PlaybackSpeed,
): Promise<ServiceResult<void>> {
  if (!soundInstance) {
    return { success: false, error: "No episode loaded" };
  }

  try {
    // shouldCorrectPitch: true maintains natural voice pitch at different speeds
    await soundInstance.setRateAsync(speed, true);
    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Failed to set speed: ${message}` };
  }
}

/**
 * Get current playback status
 */
async function getStatus(): Promise<ServiceResult<AVPlaybackStatusSuccess>> {
  if (!soundInstance) {
    return { success: false, error: "No episode loaded" };
  }

  try {
    const status = await soundInstance.getStatusAsync();
    if (!isStatusSuccess(status)) {
      return { success: false, error: "Audio not loaded" };
    }
    return { success: true, data: status };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
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
  await unloadCurrentSound();
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
    unloadCurrentSound,
    isStatusSuccess,
    resetAudioModeConfig: () => {
      isAudioModeConfigured = false;
    },
  },
};
