import { Episode, Podcast } from '../models';
import { createMockEpisode, createMockPodcast } from './mockLibrary';

/**
 * Pre-configured mock episode for FullPlayer screen tests
 * Use this when you need a standard episode for player testing
 */
export const MOCK_PLAYER_EPISODE: Episode = createMockEpisode({
  id: 'player-episode-1',
  title: 'Test Episode Title',
  description: 'A test episode for the full player',
  duration: 3600, // 1 hour
});

/**
 * Pre-configured mock podcast for FullPlayer screen tests
 * Use this when you need a standard podcast for player testing
 */
export const MOCK_PLAYER_PODCAST: Podcast = createMockPodcast({
  id: 'player-podcast-1',
  title: 'Test Podcast Title',
  artworkUrl: 'https://example.com/artwork.jpg',
  episodes: [MOCK_PLAYER_EPISODE],
});

/**
 * Creates a mock episode specifically for player testing
 * @param overrides - Optional partial Episode to override default values
 */
export const createMockPlayerEpisode = (
  overrides: Partial<Episode> = {},
): Episode =>
  createMockEpisode({
    id: 'player-episode-1',
    title: 'Test Episode Title',
    duration: 3600,
    ...overrides,
  });

/**
 * Creates a mock podcast specifically for player testing
 * @param overrides - Optional partial Podcast to override default values
 */
export const createMockPlayerPodcast = (
  overrides: Partial<Podcast> = {},
): Podcast =>
  createMockPodcast({
    id: 'player-podcast-1',
    title: 'Test Podcast Title',
    artworkUrl: 'https://example.com/artwork.jpg',
    ...overrides,
  });
