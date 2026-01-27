import { FormattedDiscoveryPodcast } from '../screens/DiscoverScreen/Discover.types';
import {
  FormattedEpisode,
  FormattedPodcastDetail,
} from '../screens/PodcastDetailScreen/PodcastDetail.types';
import { FormattedHistoryItem } from '../screens/ProfileScreen/Profile.types';
import { FormattedQueueItem } from '../screens/QueueScreen/Queue.types';

/**
 * Creates a mock FormattedDiscoveryPodcast for DiscoveryPodcastCard testing
 */
export const createMockFormattedDiscoveryPodcast = (
  overrides: Partial<FormattedDiscoveryPodcast> = {},
): FormattedDiscoveryPodcast => ({
  id: 'discovery-1',
  title: 'Test Discovery Podcast',
  displayTitle: 'Test Discovery Podcast',
  author: 'Test Author',
  artworkUrl: 'https://example.com/artwork.jpg',
  feedUrl: 'https://example.com/feed.xml',
  genre: 'Technology',
  episodeCount: 100,
  episodeCountLabel: '100 episodes',
  ...overrides,
});

/**
 * Creates a mock FormattedEpisode for CardEpisode testing
 */
export const createMockFormattedEpisode = (
  overrides: Partial<FormattedEpisode> = {},
): FormattedEpisode => ({
  id: 'episode-1',
  podcastId: 'podcast-1',
  title: 'Test Episode',
  displayTitle: 'Test Episode',
  description: 'This is a test episode description that is quite long.',
  truncatedDescription: 'This is a test episode...',
  publishDate: '2024-01-15T10:00:00Z',
  formattedPublishDate: 'Jan 15, 2024',
  duration: 3600,
  formattedDuration: '1:00:00',
  audioUrl: 'https://example.com/audio.mp3',
  played: false,
  ...overrides,
});

/**
 * Creates a mock FormattedHistoryItem for CardHistoryItem testing
 */
export const createMockFormattedHistoryItem = (
  overrides: Partial<FormattedHistoryItem> = {},
): FormattedHistoryItem => ({
  id: 'history-1',
  episodeTitle: 'Test Episode',
  displayTitle: 'Test Episode',
  podcastTitle: 'Test Podcast',
  podcastArtworkUrl: 'https://example.com/artwork.jpg',
  completedAt: '2024-01-15T10:00:00Z',
  formattedCompletedAt: 'Jan 15, 2024',
  completionPercentage: 100,
  formattedCompletionPercentage: '100%',
  ...overrides,
});

/**
 * Creates a mock FormattedQueueItem for CardQueueItem testing
 */
export const createMockFormattedQueueItem = (
  overrides: Partial<FormattedQueueItem> = {},
): FormattedQueueItem => ({
  id: 'queue-1',
  episodeId: 'episode-1',
  episodeTitle: 'Test Episode',
  displayTitle: 'Test Episode',
  podcastTitle: 'Test Podcast',
  podcastArtworkUrl: 'https://example.com/artwork.jpg',
  duration: 3600,
  formattedDuration: '1:00:00',
  position: 0,
  positionLabel: '0:00 / 1:00:00',
  isCurrentlyPlaying: false,
  ...overrides,
});

/**
 * Creates a mock FormattedPodcastDetail for HeaderPodcast testing
 */
export const createMockFormattedPodcastDetail = (
  overrides: Partial<FormattedPodcastDetail> = {},
): FormattedPodcastDetail => ({
  id: 'podcast-1',
  title: 'Test Podcast',
  author: 'Test Author',
  description:
    'This is a test podcast description that provides details about the show.',
  truncatedDescription: 'This is a test podcast description...',
  artworkUrl: 'https://example.com/artwork.jpg',
  episodeCount: 50,
  episodeCountLabel: '50 episodes',
  formattedSubscribeDate: 'Jan 1, 2024',
  episodes: [],
  ...overrides,
});

/**
 * Creates multiple mock formatted discovery podcasts
 */
export const createMockFormattedDiscoveryPodcasts = (
  count: number,
): FormattedDiscoveryPodcast[] =>
  Array.from({ length: count }, (_, i) =>
    createMockFormattedDiscoveryPodcast({
      id: `discovery-${i + 1}`,
      title: `Discovery Podcast ${i + 1}`,
      displayTitle: `Discovery Podcast ${i + 1}`,
    }),
  );

/**
 * Creates multiple mock formatted episodes
 */
export const createMockFormattedEpisodes = (
  count: number,
): FormattedEpisode[] =>
  Array.from({ length: count }, (_, i) =>
    createMockFormattedEpisode({
      id: `episode-${i + 1}`,
      title: `Episode ${i + 1}`,
      displayTitle: `Episode ${i + 1}`,
    }),
  );

/**
 * Creates multiple mock formatted history items
 */
export const createMockFormattedHistoryItems = (
  count: number,
): FormattedHistoryItem[] =>
  Array.from({ length: count }, (_, i) =>
    createMockFormattedHistoryItem({
      id: `history-${i + 1}`,
      episodeTitle: `Episode ${i + 1}`,
      displayTitle: `Episode ${i + 1}`,
    }),
  );

/**
 * Creates multiple mock formatted queue items
 */
export const createMockFormattedQueueItems = (
  count: number,
): FormattedQueueItem[] =>
  Array.from({ length: count }, (_, i) =>
    createMockFormattedQueueItem({
      id: `queue-${i + 1}`,
      episodeId: `episode-${i + 1}`,
      displayTitle: `Queue Episode ${i + 1}`,
      position: i,
    }),
  );
