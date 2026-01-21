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
