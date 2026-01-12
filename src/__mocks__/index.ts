// Library mocks (Podcast, Episode)
export {
  createMockPodcast,
  createMockEpisode,
  createMockPodcasts,
  createMockEpisodes,
} from "./mockLibrary";

// Discovery mocks (DiscoveryPodcast, iTunes API responses)
export {
  createMockDiscoveryPodcast,
  createMockDiscoveryPodcasts,
  MOCK_ITUNES_SEARCH_RESPONSE,
  MOCK_ITUNES_NO_FEED_RESPONSE,
  MOCK_ITUNES_EMPTY_RESPONSE,
  MOCK_ITUNES_LOOKUP_RESPONSE,
} from "./mockDiscovery";

// Queue mocks (QueueItem)
export { createMockQueueItem, createMockQueueItems } from "./mockQueue";

// RSS/Podcast feed mocks
export {
  MOCK_RSS_XML,
  MOCK_SINGLE_EPISODE_RSS,
  MOCK_INVALID_RSS,
  MOCK_COMPLEX_GUID_RSS,
} from "./mockPodcasts";
