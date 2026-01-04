import { AudioPlayerService } from "../AudioPlayerService";

// ===========================================
// MOCK SETUP
// ===========================================

// Create mock sound instance with all methods
const mockSoundInstance = {
  playAsync: jest.fn(() => Promise.resolve({ isLoaded: true })),
  pauseAsync: jest.fn(() => Promise.resolve({ isLoaded: true })),
  stopAsync: jest.fn(() => Promise.resolve({ isLoaded: true })),
  unloadAsync: jest.fn(() => Promise.resolve({ isLoaded: false })),
  setPositionAsync: jest.fn(() => Promise.resolve({ isLoaded: true })),
  setRateAsync: jest.fn(() => Promise.resolve({ isLoaded: true })),
  getStatusAsync: jest.fn(() =>
    Promise.resolve({
      isLoaded: true,
      positionMillis: 30000, // 30 seconds
      durationMillis: 3600000, // 1 hour
      isPlaying: true,
    }),
  ),
};

// Mock expo-av
jest.mock("expo-av", () => ({
  Audio: {
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    Sound: {
      createAsync: jest.fn(() =>
        Promise.resolve({
          sound: mockSoundInstance,
        }),
      ),
    },
  },
}));

// Import Audio after mocking
import { Audio } from "expo-av";

// Mock episode for testing
const mockEpisode = {
  id: "test-episode-1",
  podcastId: "test-podcast-1",
  title: "Test Episode",
  description: "A test episode",
  audioUrl: "https://example.com/audio.mp3",
  duration: 3600,
  publishDate: "2024-01-01T00:00:00Z",
  played: false,
};

describe("AudioPlayerService", () => {
  // Reset mocks and cleanup before each test
  beforeEach(async () => {
    jest.clearAllMocks();
    await AudioPlayerService.cleanup();
    // Reset the audio mode configured flag for clean tests
    AudioPlayerService._helpers.resetAudioModeConfig();
  });

  // -----------------------------------------
  // Audio Mode Configuration Tests
  // -----------------------------------------
  describe("configureAudioMode", () => {
    it("should configure audio mode on first call", async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);

      expect(Audio.setAudioModeAsync).toHaveBeenCalledWith({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    });

    it("should only configure audio mode once", async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      await AudioPlayerService.loadEpisode(mockEpisode);

      // Should only be called once despite loading twice
      expect(Audio.setAudioModeAsync).toHaveBeenCalledTimes(1);
    });
  });

  // -----------------------------------------
  // Load Episode Tests
  // -----------------------------------------
  describe("loadEpisode", () => {
    it("should successfully load an episode", async () => {
      const result = await AudioPlayerService.loadEpisode(mockEpisode);

      expect(result.success).toBe(true);
      expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
        { uri: mockEpisode.audioUrl },
        { shouldPlay: false, progressUpdateIntervalMillis: 1000 },
        expect.any(Function),
      );
    });

    it("should set the current episode ID", async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);

      expect(AudioPlayerService.getCurrentEpisodeId()).toBe(mockEpisode.id);
    });

    it("should unload previous sound before loading new one", async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      await AudioPlayerService.loadEpisode({
        ...mockEpisode,
        id: "episode-2",
      });

      expect(mockSoundInstance.unloadAsync).toHaveBeenCalled();
    });

    it("should return error when createAsync fails", async () => {
      (Audio.Sound.createAsync as jest.Mock).mockRejectedValueOnce(
        new Error("Failed to load audio"),
      );

      const result = await AudioPlayerService.loadEpisode(mockEpisode);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Failed to load episode");
      }
    });
  });

  // -----------------------------------------
  // Play/Pause/Stop Tests
  // -----------------------------------------
  describe("play", () => {
    it("should return error when no episode is loaded", async () => {
      const result = await AudioPlayerService.play();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("No episode loaded");
      }
    });

    it("should successfully play loaded episode", async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      const result = await AudioPlayerService.play();

      expect(result.success).toBe(true);
      expect(mockSoundInstance.playAsync).toHaveBeenCalled();
    });
  });

  describe("pause", () => {
    it("should return error when no episode is loaded", async () => {
      const result = await AudioPlayerService.pause();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("No episode loaded");
      }
    });

    it("should successfully pause playback", async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      const result = await AudioPlayerService.pause();

      expect(result.success).toBe(true);
      expect(mockSoundInstance.pauseAsync).toHaveBeenCalled();
    });
  });

  describe("stop", () => {
    it("should return error when no episode is loaded", async () => {
      const result = await AudioPlayerService.stop();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("No episode loaded");
      }
    });

    it("should successfully stop playback", async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      const result = await AudioPlayerService.stop();

      expect(result.success).toBe(true);
      expect(mockSoundInstance.stopAsync).toHaveBeenCalled();
    });
  });

  // -----------------------------------------
  // Seek Tests
  // -----------------------------------------
  describe("seek", () => {
    it("should return error when no episode is loaded", async () => {
      const result = await AudioPlayerService.seek(60);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("No episode loaded");
      }
    });

    it("should seek to position in milliseconds", async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      const result = await AudioPlayerService.seek(60); // 60 seconds

      expect(result.success).toBe(true);
      expect(mockSoundInstance.setPositionAsync).toHaveBeenCalledWith(60000); // 60 * 1000
    });
  });

  // -----------------------------------------
  // Skip Forward/Backward Tests
  // -----------------------------------------
  describe("skipForward", () => {
    it("should skip forward by default 15 seconds", async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      await AudioPlayerService.skipForward();

      // Current position is 30s (from mock), skip forward 15s = 45s = 45000ms
      expect(mockSoundInstance.setPositionAsync).toHaveBeenCalledWith(45000);
    });

    it("should skip forward by custom amount", async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      await AudioPlayerService.skipForward(30);

      // Current position is 30s, skip forward 30s = 60s = 60000ms
      expect(mockSoundInstance.setPositionAsync).toHaveBeenCalledWith(60000);
    });
  });

  describe("skipBackward", () => {
    it("should skip backward by default 15 seconds", async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      await AudioPlayerService.skipBackward();

      // Current position is 30s, skip backward 15s = 15s = 15000ms
      expect(mockSoundInstance.setPositionAsync).toHaveBeenCalledWith(15000);
    });

    it("should not go below 0", async () => {
      // Set position to 5 seconds
      mockSoundInstance.getStatusAsync.mockResolvedValueOnce({
        isLoaded: true,
        positionMillis: 5000,
        durationMillis: 3600000,
        isPlaying: true,
      });

      await AudioPlayerService.loadEpisode(mockEpisode);
      await AudioPlayerService.skipBackward(15);

      // Would be -10s, but should clamp to 0
      expect(mockSoundInstance.setPositionAsync).toHaveBeenCalledWith(0);
    });
  });

  // -----------------------------------------
  // Playback Speed Tests
  // -----------------------------------------
  describe("setPlaybackSpeed", () => {
    it("should return error when no episode is loaded", async () => {
      const result = await AudioPlayerService.setPlaybackSpeed(1.5);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("No episode loaded");
      }
    });

    it("should set playback speed with pitch correction", async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      const result = await AudioPlayerService.setPlaybackSpeed(1.5);

      expect(result.success).toBe(true);
      expect(mockSoundInstance.setRateAsync).toHaveBeenCalledWith(1.5, true);
    });
  });

  // -----------------------------------------
  // Get Status Tests
  // -----------------------------------------
  describe("getStatus", () => {
    it("should return error when no episode is loaded", async () => {
      const result = await AudioPlayerService.getStatus();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("No episode loaded");
      }
    });

    it("should return current playback status", async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      const result = await AudioPlayerService.getStatus();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.positionMillis).toBe(30000);
        expect(result.data.durationMillis).toBe(3600000);
      }
    });
  });

  // -----------------------------------------
  // Callback Registration Tests
  // -----------------------------------------
  describe("callbacks", () => {
    it("should register progress callback", () => {
      const callback = jest.fn();
      AudioPlayerService.setOnProgress(callback);

      // Callback is stored internally - we verify by checking it doesn't throw
      expect(() => AudioPlayerService.setOnProgress(null)).not.toThrow();
    });

    it("should register end callback", () => {
      const callback = jest.fn();
      AudioPlayerService.setOnEnd(callback);

      expect(() => AudioPlayerService.setOnEnd(null)).not.toThrow();
    });

    it("should register error callback", () => {
      const callback = jest.fn();
      AudioPlayerService.setOnError(callback);

      expect(() => AudioPlayerService.setOnError(null)).not.toThrow();
    });
  });

  // -----------------------------------------
  // Cleanup Tests
  // -----------------------------------------
  describe("cleanup", () => {
    it("should unload sound and clear callbacks", async () => {
      await AudioPlayerService.loadEpisode(mockEpisode);
      AudioPlayerService.setOnProgress(jest.fn());
      AudioPlayerService.setOnEnd(jest.fn());
      AudioPlayerService.setOnError(jest.fn());

      await AudioPlayerService.cleanup();

      expect(mockSoundInstance.unloadAsync).toHaveBeenCalled();
      expect(AudioPlayerService.getCurrentEpisodeId()).toBeNull();
    });
  });

  // -----------------------------------------
  // Helper Function Tests
  // -----------------------------------------
  describe("helper functions", () => {
    describe("isStatusSuccess", () => {
      const { isStatusSuccess } = AudioPlayerService._helpers;

      it("should return true for loaded status", () => {
        expect(isStatusSuccess({ isLoaded: true } as any)).toBe(true);
      });

      it("should return false for unloaded status", () => {
        expect(isStatusSuccess({ isLoaded: false } as any)).toBe(false);
      });
    });
  });
});
