// Unmock AudioPlayerService for this test file
import { AudioPlayerService } from '../AudioPlayerService';

// Import expo-audio after mocking
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

jest.unmock('../AudioPlayerService');

// ===========================================
// MOCK SETUP
// ===========================================

// Minimal shape of expo-audio's AudioStatus used by the service
interface MockAudioStatus {
  isLoaded: boolean;
  currentTime: number;
  duration: number;
  didJustFinish?: boolean;
}

type StatusListener = (status: MockAudioStatus) => void;

// Create mock player instance with all methods and properties
// expo-audio works in seconds and exposes state as properties
const mockPlayerInstance = {
  play: jest.fn(),
  pause: jest.fn(),
  // Models a precise (zero-tolerance) seek: the player lands on the target
  seekTo: jest.fn((positionSeconds: number) => {
    mockPlayerInstance.currentTime = positionSeconds;
    return Promise.resolve();
  }),
  setPlaybackRate: jest.fn(),
  remove: jest.fn(),
  addListener: jest.fn((_event: string, _listener: StatusListener) => ({
    remove: jest.fn(),
  })),
  isLoaded: true,
  currentTime: 30, // 30 seconds
  duration: 3600, // 1 hour
  playing: true,
};

// Mock expo-audio
jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => mockPlayerInstance),
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
}));

// Mock episode for testing
const mockEpisode = {
  id: 'test-episode-1',
  podcastId: 'test-podcast-1',
  title: 'Test Episode',
  description: 'A test episode',
  audioUrl: 'https://example.com/audio.mp3',
  duration: 3600,
  publishDate: '2024-01-01T00:00:00Z',
  played: false,
};

describe('AudioPlayerService', () => {
  // Reset mocks and cleanup before each test
  beforeEach(async () => {
    jest.clearAllMocks();
    await AudioPlayerService.cleanup();
    // Reset the audio mode configured flag and player state for clean tests
    AudioPlayerService._helpers.resetAudioModeConfig();
    mockPlayerInstance.isLoaded = true;
    mockPlayerInstance.currentTime = 30;
    mockPlayerInstance.duration = 3600;
    mockPlayerInstance.playing = true;
  });

  // -----------------------------------------
  // Audio Mode Configuration Tests
  // -----------------------------------------
  describe('configureAudioMode', () => {
    it('should configure audio mode on first call', async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);

      expect(setAudioModeAsync).toHaveBeenCalledWith({
        shouldPlayInBackground: true,
        playsInSilentMode: true,
        interruptionMode: 'duckOthers',
        shouldRouteThroughEarpiece: false,
      });
    });

    it('should only configure audio mode once', async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      await AudioPlayerService.loadEpisode(mockEpisode);

      // Should only be called once despite loading twice
      expect(setAudioModeAsync).toHaveBeenCalledTimes(1);
    });
  });

  // -----------------------------------------
  // Load Episode Tests
  // -----------------------------------------
  describe('loadEpisode', () => {
    it('should successfully load an episode', async () => {
      const result = await AudioPlayerService.loadEpisode(mockEpisode);

      expect(result.success).toBe(true);
      expect(createAudioPlayer).toHaveBeenCalledWith(
        { uri: mockEpisode.audioUrl },
        { updateInterval: 1000 },
      );
      expect(mockPlayerInstance.addListener).toHaveBeenCalledWith(
        'playbackStatusUpdate',
        expect.any(Function),
      );
    });

    it('should set the current episode ID', async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);

      expect(AudioPlayerService.getCurrentEpisodeId()).toBe(mockEpisode.id);
    });

    it('should remove previous player before loading new one', async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      await AudioPlayerService.loadEpisode({
        ...mockEpisode,
        id: 'episode-2',
      });

      expect(mockPlayerInstance.remove).toHaveBeenCalled();
    });

    it('should pause the previous player before removing it when loading a new episode', async () => {
      // expo-audio's remove() only deregisters the player natively; without an
      // explicit pause() the old episode's audio keeps playing until GC
      await AudioPlayerService.loadEpisode(mockEpisode);
      mockPlayerInstance.pause.mockClear();
      mockPlayerInstance.remove.mockClear();

      await AudioPlayerService.loadEpisode({
        ...mockEpisode,
        id: 'episode-2',
      });

      expect(mockPlayerInstance.pause).toHaveBeenCalled();
      expect(mockPlayerInstance.remove).toHaveBeenCalled();
      expect(mockPlayerInstance.pause.mock.invocationCallOrder[0]).toBeLessThan(
        mockPlayerInstance.remove.mock.invocationCallOrder[0],
      );
    });

    it('should return error when createAudioPlayer fails', async () => {
      (createAudioPlayer as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Failed to load audio');
      });

      const result = await AudioPlayerService.loadEpisode(mockEpisode);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Failed to load episode');
      }
    });

    it('should notify error callback when load fails', async () => {
      const errorCallback = jest.fn();
      AudioPlayerService.setOnError(errorCallback);
      (createAudioPlayer as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Failed to load audio');
      });

      await AudioPlayerService.loadEpisode(mockEpisode);

      expect(errorCallback).toHaveBeenCalledWith('Failed to load audio');
    });
  });

  // -----------------------------------------
  // Play/Pause/Stop Tests
  // -----------------------------------------
  describe('play', () => {
    it('should return error when no episode is loaded', async () => {
      const result = await AudioPlayerService.play();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('No episode loaded');
      }
    });

    it('should successfully play loaded episode', async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      const result = await AudioPlayerService.play();

      expect(result.success).toBe(true);
      expect(mockPlayerInstance.play).toHaveBeenCalled();
    });

    it('should restart from the beginning when playing a finished episode', async () => {
      // expo-audio parks the player at the end when audio finishes (unlike
      // expo-av); play() alone does nothing there, so rewind to 0 first
      await AudioPlayerService.loadEpisode(mockEpisode);
      mockPlayerInstance.currentTime = 3600; // parked at the end

      const result = await AudioPlayerService.play();

      expect(result.success).toBe(true);
      expect(mockPlayerInstance.seekTo).toHaveBeenCalledWith(0, 0, 0);
      expect(mockPlayerInstance.play).toHaveBeenCalled();
    });

    it('should not reset position when playing mid-episode', async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      mockPlayerInstance.currentTime = 30;

      await AudioPlayerService.play();

      expect(mockPlayerInstance.seekTo).not.toHaveBeenCalled();
    });
  });

  describe('pause', () => {
    it('should return error when no episode is loaded', async () => {
      const result = await AudioPlayerService.pause();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('No episode loaded');
      }
    });

    it('should successfully pause playback', async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      const result = await AudioPlayerService.pause();

      expect(result.success).toBe(true);
      expect(mockPlayerInstance.pause).toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('should return error when no episode is loaded', async () => {
      const result = await AudioPlayerService.stop();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('No episode loaded');
      }
    });

    it('should pause and reset position to beginning', async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      const result = await AudioPlayerService.stop();

      expect(result.success).toBe(true);
      expect(mockPlayerInstance.pause).toHaveBeenCalled();
      expect(mockPlayerInstance.seekTo).toHaveBeenCalledWith(0, 0, 0);
    });
  });

  // -----------------------------------------
  // Seek Tests
  // -----------------------------------------
  describe('seek', () => {
    it('should return error when no episode is loaded', async () => {
      const result = await AudioPlayerService.seek(60);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('No episode loaded');
      }
    });

    it('should seek to position in seconds', async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      const result = await AudioPlayerService.seek(60);

      expect(result.success).toBe(true);
      expect(mockPlayerInstance.seekTo).toHaveBeenCalledWith(60, 0, 0);
    });

    it('should seek with zero tolerance so iOS lands exactly on the target', async () => {
      // Without explicit tolerances expo-audio defaults to infinity on iOS,
      // landing up to ~1s before the target and bouncing the UI backward
      await AudioPlayerService.loadEpisode(mockEpisode);
      await AudioPlayerService.seek(130);

      expect(mockPlayerInstance.seekTo).toHaveBeenCalledWith(130, 0, 0);
    });
  });

  // -----------------------------------------
  // Seek Progress Settling Tests
  // -----------------------------------------
  // expo-audio keeps emitting playbackStatusUpdate events with the pre-seek
  // currentTime while a seek is in flight (and they can arrive after the
  // seekTo promise resolves). The service must drop those stale progress
  // updates or the UI position jumps back and flickers after skip/seek.
  describe('seek progress settling', () => {
    // The status listener registered by loadEpisode
    const getStatusListener = (): StatusListener =>
      mockPlayerInstance.addListener.mock.calls[0][1] as StatusListener;

    it('should drop stale progress updates after a seek until playback catches up to the target', async () => {
      const onProgress = jest.fn();
      AudioPlayerService.setOnProgress(onProgress);
      await AudioPlayerService.loadEpisode(mockEpisode);
      const statusListener = getStatusListener();

      mockPlayerInstance.currentTime = 100;
      await AudioPlayerService.seek(130);
      onProgress.mockClear();

      // Stale tick from before the seek landed - must be dropped
      statusListener({ isLoaded: true, currentTime: 100.9, duration: 3600 });
      expect(onProgress).not.toHaveBeenCalled();

      // Playback has caught up to the seek target - must pass through
      statusListener({ isLoaded: true, currentTime: 130.4, duration: 3600 });
      expect(onProgress).toHaveBeenCalledWith(130.4, 3600);
    });

    it('should resume normal progress updates once caught up after a seek', async () => {
      const onProgress = jest.fn();
      AudioPlayerService.setOnProgress(onProgress);
      await AudioPlayerService.loadEpisode(mockEpisode);
      const statusListener = getStatusListener();

      await AudioPlayerService.seek(130);
      statusListener({ isLoaded: true, currentTime: 130.4, duration: 3600 });
      onProgress.mockClear();

      // Guard is cleared - every subsequent tick passes through unfiltered
      statusListener({ isLoaded: true, currentTime: 131.4, duration: 3600 });
      expect(onProgress).toHaveBeenCalledWith(131.4, 3600);
    });

    it('should emit the landed position immediately when seek resolves', async () => {
      // The event stream can lag seconds behind on streamed audio, so the
      // service emits the landed position itself the moment the seek resolves
      const onProgress = jest.fn();
      AudioPlayerService.setOnProgress(onProgress);
      await AudioPlayerService.loadEpisode(mockEpisode);

      await AudioPlayerService.seek(130);

      expect(onProgress).toHaveBeenCalledWith(130, 3600);
    });

    it('should drop late status events that fall behind the landed position', async () => {
      // A stale event near the target but behind the emitted landed position
      // is older data arriving late (this caused the 1s flicker at 2x speed)
      const onProgress = jest.fn();
      AudioPlayerService.setOnProgress(onProgress);
      await AudioPlayerService.loadEpisode(mockEpisode);
      const statusListener = getStatusListener();

      await AudioPlayerService.seek(130.5);
      onProgress.mockClear();

      // Behind the landed position (130.5) - dropped even though near target
      statusListener({ isLoaded: true, currentTime: 130.2, duration: 3600 });
      expect(onProgress).not.toHaveBeenCalled();

      // At/past the landed position - passes and clears the floor
      statusListener({ isLoaded: true, currentTime: 130.6, duration: 3600 });
      expect(onProgress).toHaveBeenCalledWith(130.6, 3600);

      // Floor cleared - normal ticks flow unfiltered again
      statusListener({ isLoaded: true, currentTime: 131.6, duration: 3600 });
      expect(onProgress).toHaveBeenCalledWith(131.6, 3600);
    });

    it('should still report completion while the seek guard is active', async () => {
      const onEnd = jest.fn();
      AudioPlayerService.setOnEnd(onEnd);
      await AudioPlayerService.loadEpisode(mockEpisode);
      const statusListener = getStatusListener();

      await AudioPlayerService.seek(3590);

      // Stale tick, but carrying didJustFinish - completion must not be lost
      statusListener({
        isLoaded: true,
        currentTime: 100,
        duration: 3600,
        didJustFinish: true,
      });
      expect(onEnd).toHaveBeenCalled();
    });
  });

  // -----------------------------------------
  // Skip Forward/Backward Tests
  // -----------------------------------------
  describe('skipForward', () => {
    it('should skip forward by default 15 seconds', async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      await AudioPlayerService.skipForward();

      // Current position is 30s (from mock), skip forward 15s = 45s
      expect(mockPlayerInstance.seekTo).toHaveBeenCalledWith(45, 0, 0);
    });

    it('should skip forward by custom amount', async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      await AudioPlayerService.skipForward(30);

      // Current position is 30s, skip forward 30s = 60s
      expect(mockPlayerInstance.seekTo).toHaveBeenCalledWith(60, 0, 0);
    });
  });

  describe('skipBackward', () => {
    it('should skip backward by default 15 seconds', async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      await AudioPlayerService.skipBackward();

      // Current position is 30s, skip backward 15s = 15s
      expect(mockPlayerInstance.seekTo).toHaveBeenCalledWith(15, 0, 0);
    });

    it('should not go below 0', async () => {
      // Set position to 5 seconds
      mockPlayerInstance.currentTime = 5;

      await AudioPlayerService.loadEpisode(mockEpisode);
      await AudioPlayerService.skipBackward(15);

      // Would be -10s, but should clamp to 0
      expect(mockPlayerInstance.seekTo).toHaveBeenCalledWith(0, 0, 0);
    });
  });

  // -----------------------------------------
  // Playback Speed Tests
  // -----------------------------------------
  describe('setPlaybackSpeed', () => {
    it('should return error when no episode is loaded', async () => {
      const result = await AudioPlayerService.setPlaybackSpeed(1.5);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('No episode loaded');
      }
    });

    it('should set playback speed with pitch correction', async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      const result = await AudioPlayerService.setPlaybackSpeed(1.5);

      expect(result.success).toBe(true);
      expect(mockPlayerInstance.setPlaybackRate).toHaveBeenCalledWith(
        1.5,
        'high',
      );
    });
  });

  // -----------------------------------------
  // Get Status Tests
  // -----------------------------------------
  describe('getStatus', () => {
    it('should return error when no episode is loaded', async () => {
      const result = await AudioPlayerService.getStatus();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('No episode loaded');
      }
    });

    it('should return current playback status in seconds', async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      const result = await AudioPlayerService.getStatus();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.positionSeconds).toBe(30);
        expect(result.data.durationSeconds).toBe(3600);
        expect(result.data.isPlaying).toBe(true);
      }
    });

    it('should return error when audio is not loaded yet', async () => {
      mockPlayerInstance.isLoaded = false;

      await AudioPlayerService.loadEpisode(mockEpisode);
      const result = await AudioPlayerService.getStatus();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Audio not loaded');
      }
    });
  });

  // -----------------------------------------
  // Callback Registration Tests
  // -----------------------------------------
  describe('callbacks', () => {
    it('should register progress callback', () => {
      const callback = jest.fn();
      AudioPlayerService.setOnProgress(callback);

      // Callback is stored internally - we verify by checking it doesn't throw
      expect(() => AudioPlayerService.setOnProgress(null)).not.toThrow();
    });

    it('should register end callback', () => {
      const callback = jest.fn();
      AudioPlayerService.setOnEnd(callback);

      expect(() => AudioPlayerService.setOnEnd(null)).not.toThrow();
    });

    it('should register error callback', () => {
      const callback = jest.fn();
      AudioPlayerService.setOnError(callback);

      expect(() => AudioPlayerService.setOnError(null)).not.toThrow();
    });
  });

  // -----------------------------------------
  // Cleanup Tests
  // -----------------------------------------
  describe('cleanup', () => {
    it('should remove player and clear callbacks', async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      AudioPlayerService.setOnProgress(jest.fn());
      AudioPlayerService.setOnEnd(jest.fn());
      AudioPlayerService.setOnError(jest.fn());

      await AudioPlayerService.cleanup();

      expect(mockPlayerInstance.remove).toHaveBeenCalled();
      expect(AudioPlayerService.getCurrentEpisodeId()).toBeNull();
    });

    it('should remove the status listener subscription', async () => {
      const subscription = { remove: jest.fn() };
      mockPlayerInstance.addListener.mockReturnValueOnce(subscription);

      await AudioPlayerService.loadEpisode(mockEpisode);
      await AudioPlayerService.cleanup();

      expect(subscription.remove).toHaveBeenCalled();
    });
  });

  // -----------------------------------------
  // Error Handling Tests
  // -----------------------------------------
  describe('error handling', () => {
    it('should handle play error', async () => {
      mockPlayerInstance.play.mockImplementationOnce(() => {
        throw new Error('Playback failed');
      });

      await AudioPlayerService.loadEpisode(mockEpisode);
      const result = await AudioPlayerService.play();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Failed to play');
      }
    });

    it('should handle pause error', async () => {
      mockPlayerInstance.pause.mockImplementationOnce(() => {
        throw new Error('Pause failed');
      });

      await AudioPlayerService.loadEpisode(mockEpisode);
      const result = await AudioPlayerService.pause();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Failed to pause');
      }
    });

    it('should handle stop error', async () => {
      mockPlayerInstance.pause.mockImplementationOnce(() => {
        throw new Error('Stop failed');
      });

      await AudioPlayerService.loadEpisode(mockEpisode);
      const result = await AudioPlayerService.stop();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Failed to stop');
      }
    });

    it('should handle seek error', async () => {
      mockPlayerInstance.seekTo.mockRejectedValueOnce(new Error('Seek failed'));

      await AudioPlayerService.loadEpisode(mockEpisode);
      const result = await AudioPlayerService.seek(60);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Failed to seek');
      }
    });

    it('should handle setPlaybackSpeed error', async () => {
      mockPlayerInstance.setPlaybackRate.mockImplementationOnce(() => {
        throw new Error('Speed change failed');
      });

      await AudioPlayerService.loadEpisode(mockEpisode);
      const result = await AudioPlayerService.setPlaybackSpeed(1.5);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Failed to set speed');
      }
    });

    it('should handle skipForward when audio is not loaded', async () => {
      mockPlayerInstance.isLoaded = false;

      await AudioPlayerService.loadEpisode(mockEpisode);
      const result = await AudioPlayerService.skipForward();

      expect(result.success).toBe(false);
    });

    it('should handle skipBackward when audio is not loaded', async () => {
      mockPlayerInstance.isLoaded = false;

      await AudioPlayerService.loadEpisode(mockEpisode);
      const result = await AudioPlayerService.skipBackward();

      expect(result.success).toBe(false);
    });

    it('should handle audio mode configuration error', async () => {
      AudioPlayerService._helpers.resetAudioModeConfig();
      (setAudioModeAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Audio mode error'),
      );

      const result = await AudioPlayerService.loadEpisode(mockEpisode);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Failed to configure audio mode');
      }
    });
  });

  // -----------------------------------------
  // Playback Status Update Callback Tests
  // -----------------------------------------
  describe('playback status callbacks', () => {
    let statusCallback: StatusListener;

    beforeEach(async () => {
      // Capture the status callback when addListener is called
      mockPlayerInstance.addListener.mockImplementation(
        (_event: string, listener: StatusListener) => {
          statusCallback = listener;
          return { remove: jest.fn() };
        },
      );

      await AudioPlayerService.loadEpisode(mockEpisode);
    });

    it('should call progress callback with position and duration in seconds', () => {
      const progressCallback = jest.fn();
      AudioPlayerService.setOnProgress(progressCallback);

      // Simulate status update (expo-audio reports seconds)
      statusCallback({
        isLoaded: true,
        currentTime: 30,
        duration: 3600,
      });

      expect(progressCallback).toHaveBeenCalledWith(30, 3600);
    });

    it('should call end callback when playback finishes', () => {
      const endCallback = jest.fn();
      AudioPlayerService.setOnEnd(endCallback);

      // Simulate playback finished
      statusCallback({
        isLoaded: true,
        currentTime: 3600,
        duration: 3600,
        didJustFinish: true,
      });

      expect(endCallback).toHaveBeenCalled();
    });

    it('should ignore status updates before audio is loaded', () => {
      const progressCallback = jest.fn();
      AudioPlayerService.setOnProgress(progressCallback);

      statusCallback({
        isLoaded: false,
        currentTime: 0,
        duration: 0,
      });

      expect(progressCallback).not.toHaveBeenCalled();
    });

    it('should not call progress callback when not set', () => {
      AudioPlayerService.setOnProgress(null);

      // Should not throw when callback is null
      expect(() => {
        statusCallback({
          isLoaded: true,
          currentTime: 30,
          duration: 3600,
        });
      }).not.toThrow();
    });

    it('should not call end callback when not set', () => {
      AudioPlayerService.setOnEnd(null);

      // Should not throw when callback is null
      expect(() => {
        statusCallback({
          isLoaded: true,
          currentTime: 3600,
          duration: 3600,
          didJustFinish: true,
        });
      }).not.toThrow();
    });
  });
});
