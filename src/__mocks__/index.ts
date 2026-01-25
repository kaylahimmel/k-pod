// Discovery mocks (DiscoveryPodcast, iTunes API responses)
export {
  createMockDiscoveryPodcast,
  createMockDiscoveryPodcasts,
  MOCK_ITUNES_SEARCH_RESPONSE,
  MOCK_ITUNES_NO_FEED_RESPONSE,
  MOCK_ITUNES_EMPTY_RESPONSE,
  MOCK_ITUNES_LOOKUP_RESPONSE,
  MOCK_PREVIEW_DISCOVERY_PODCAST,
} from './mockDiscovery';

// Library mocks (Podcast, Episode)
export {
  createMockPodcast,
  createMockEpisode,
  createMockPodcasts,
  createMockEpisodes,
} from './mockLibrary';

// Podcast RSS feed mocks
export {
  MOCK_RSS_XML,
  MOCK_SINGLE_EPISODE_RSS,
  MOCK_INVALID_RSS,
  MOCK_COMPLEX_GUID_RSS,
} from './mockPodcasts';

// Profile mocks (User, ListeningHistory)
export {
  createMockUser,
  createMockListeningHistory,
  createMockListeningHistoryItems,
} from './mockProfile';

// Queue mocks (QueueItem)
export { createMockQueueItem, createMockQueueItems } from './mockQueue';

// Navigation mocks (for screen testing)
export { createMockNavigation, createMockRoute } from './mockNavigation';

// FullPlayer mocks (pre-configured for player testing)
export {
  MOCK_PLAYER_EPISODE,
  MOCK_PLAYER_PODCAST,
  createMockPlayerEpisode,
  createMockPlayerPodcast,
} from './mockFullPlayer';

// Service mocks (for mocking API/storage services in tests)
export {
  createMockStorageService,
  createMockDiscoveryService,
  createMockRSSService,
  createMockAudioPlayerService,
  MOCK_STORAGE_SERVICE,
  MOCK_DISCOVERY_SERVICE,
  MOCK_RSS_SERVICE,
  MOCK_AUDIO_PLAYER_SERVICE,
  MOCK_ALL_SERVICES,
} from './mockServices';
