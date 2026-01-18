import { Podcast, Episode } from '../models';

/**
 * Creates a mock Podcast object for testing
 * @param overrides - Optional partial Podcast to override default values
 */
export const createMockPodcast = (
  overrides: Partial<Podcast> = {},
): Podcast => ({
  id: 'podcast-1',
  title: 'Test Podcast',
  author: 'Test Author',
  rssUrl: 'https://example.com/feed.xml',
  artworkUrl: 'https://example.com/artwork.jpg',
  description: 'A test podcast description',
  subscribeDate: '2024-01-01T00:00:00Z',
  lastUpdated: '2024-01-01T00:00:00Z',
  episodes: [],
  ...overrides,
});

/**
 * Creates a mock Episode object for testing
 * @param overrides - Optional partial Episode to override default values
 */
export const createMockEpisode = (
  overrides: Partial<Episode> = {},
): Episode => ({
  id: 'episode-1',
  podcastId: 'podcast-1',
  title: 'Test Episode',
  description: 'A test episode description',
  audioUrl: 'https://example.com/audio.mp3',
  duration: 3600, // 1 hour in seconds
  publishDate: '2024-01-01T00:00:00Z',
  played: false,
  ...overrides,
});

/**
 * Creates multiple mock podcasts for testing list scenarios
 * @param count - Number of podcasts to create
 */
export const createMockPodcasts = (count: number): Podcast[] =>
  Array.from({ length: count }, (_, i) =>
    createMockPodcast({
      id: `podcast-${i + 1}`,
      title: `Test Podcast ${i + 1}`,
    }),
  );

/**
 * Creates multiple mock episodes for testing list scenarios
 * @param count - Number of episodes to create
 * @param podcastId - Optional podcast ID to assign to all episodes
 */
export const createMockEpisodes = (
  count: number,
  podcastId = 'podcast-1',
): Episode[] =>
  Array.from({ length: count }, (_, i) =>
    createMockEpisode({
      id: `episode-${i + 1}`,
      podcastId,
      title: `Test Episode ${i + 1}`,
    }),
  );
