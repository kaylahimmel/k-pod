/**
 * Mock implementations for services used in tests
 * These can be used with jest.mock() to provide consistent mock behavior
 */

/**
 * Creates a mock StorageService for testing
 * Used for history, settings, and playback position persistence
 */
export const createMockStorageService = () => ({
  loadHistory: jest.fn().mockResolvedValue([]),
  saveHistory: jest.fn().mockResolvedValue(undefined),
  loadSettings: jest.fn().mockResolvedValue(null),
  saveSettings: jest.fn().mockResolvedValue(undefined),
  loadPlaybackPosition: jest.fn().mockResolvedValue(null),
  savePlaybackPosition: jest.fn().mockResolvedValue(undefined),
  removePlaybackPosition: jest.fn().mockResolvedValue(undefined),
  loadPodcasts: jest.fn().mockResolvedValue([]),
  savePodcasts: jest.fn().mockResolvedValue(undefined),
  loadQueue: jest.fn().mockResolvedValue([]),
  saveQueue: jest.fn().mockResolvedValue(undefined),
});

/**
 * Creates a mock DiscoveryService for testing
 * Used for podcast search and trending functionality
 */
export const createMockDiscoveryService = () => ({
  searchPodcasts: jest.fn().mockResolvedValue({ success: true, data: [] }),
  getTrendingPodcasts: jest.fn().mockResolvedValue({ success: true, data: [] }),
  getRecommendations: jest.fn().mockResolvedValue({ success: true, data: [] }),
});

/**
 * Creates a mock RSSService for testing
 * Used for fetching and parsing podcast RSS feeds
 */
export const createMockRSSService = () => ({
  fetchPodcastByRSS: jest.fn().mockResolvedValue({ success: true, data: null }),
  getEpisodes: jest.fn().mockResolvedValue({ success: true, data: [] }),
  transformPodcastFromRSS: jest.fn().mockResolvedValue(null),
});

/**
 * Creates a mock AudioPlayerService for testing
 * Used for audio playback functionality
 */
export const createMockAudioPlayerService = () => ({
  loadEpisode: jest.fn().mockResolvedValue(undefined),
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  seek: jest.fn().mockResolvedValue(undefined),
  setPlaybackSpeed: jest.fn().mockResolvedValue(undefined),
  getPosition: jest.fn().mockResolvedValue(0),
  getDuration: jest.fn().mockResolvedValue(0),
  isPlaying: jest.fn().mockReturnValue(false),
});

/**
 * Pre-configured mock objects for use with jest.mock()
 * Usage: jest.mock('../../../services', () => MOCK_SERVICES)
 */
export const MOCK_STORAGE_SERVICE = createMockStorageService();
export const MOCK_DISCOVERY_SERVICE = createMockDiscoveryService();
export const MOCK_RSS_SERVICE = createMockRSSService();
export const MOCK_AUDIO_PLAYER_SERVICE = createMockAudioPlayerService();

/**
 * Combined mock for all services
 * Usage: jest.mock('../../../services', () => MOCK_ALL_SERVICES)
 */
export const MOCK_ALL_SERVICES = {
  StorageService: MOCK_STORAGE_SERVICE,
  DiscoveryService: MOCK_DISCOVERY_SERVICE,
  RSSService: MOCK_RSS_SERVICE,
  AudioPlayerService: MOCK_AUDIO_PLAYER_SERVICE,
};
