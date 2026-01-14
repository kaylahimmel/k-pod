import type { ITunesSearchResponse, DiscoveryPodcast } from "../models";

/**
 * Creates a mock DiscoveryPodcast object for testing
 * @param overrides - Optional partial DiscoveryPodcast to override default values
 */
export const createMockDiscoveryPodcast = (
  overrides: Partial<DiscoveryPodcast> = {},
): DiscoveryPodcast => ({
  id: "123",
  title: "Test Podcast",
  author: "Test Author",
  feedUrl: "https://example.com/feed.xml",
  artworkUrl: "https://example.com/artwork.jpg",
  genre: "Technology",
  episodeCount: 100,
  ...overrides,
});

/**
 * Creates multiple mock discovery podcasts for testing list scenarios
 * @param count - Number of podcasts to create
 */
export const createMockDiscoveryPodcasts = (
  count: number,
): DiscoveryPodcast[] =>
  Array.from({ length: count }, (_, i) =>
    createMockDiscoveryPodcast({
      id: `discovery-${i + 1}`,
      title: `Discovery Podcast ${i + 1}`,
      feedUrl: `https://example.com/feed${i + 1}.xml`,
    }),
  );

/**
 * Mock iTunes Search API response with multiple podcasts
 */
export const MOCK_ITUNES_SEARCH_RESPONSE: ITunesSearchResponse = {
  resultCount: 3,
  results: [
    {
      trackId: 123456,
      trackName: "Tech Talk Daily",
      artistName: "Jane Developer",
      collectionName: "Tech Talk Daily",
      feedUrl: "https://example.com/techtalk/feed.xml",
      artworkUrl100: "https://example.com/techtalk/art100.jpg",
      artworkUrl600: "https://example.com/techtalk/art600.jpg",
      primaryGenreName: "Technology",
      genres: ["Technology", "Business"],
      trackCount: 150,
      releaseDate: "2024-01-15T00:00:00Z",
      country: "USA",
    },
    {
      trackId: 789012,
      trackName: "Comedy Hour",
      artistName: "Funny People Inc",
      collectionName: "Comedy Hour Podcast",
      feedUrl: "https://example.com/comedy/feed.xml",
      artworkUrl100: "https://example.com/comedy/art100.jpg",
      artworkUrl600: "https://example.com/comedy/art600.jpg",
      primaryGenreName: "Comedy",
      genres: ["Comedy", "Entertainment"],
      trackCount: 200,
      releaseDate: "2024-02-01T00:00:00Z",
      country: "USA",
    },
    {
      trackId: 345678,
      trackName: "Science Weekly",
      artistName: "Dr. Research",
      collectionName: "Science Weekly",
      feedUrl: "https://example.com/science/feed.xml",
      artworkUrl100: "https://example.com/science/art100.jpg",
      artworkUrl600: "https://example.com/science/art600.jpg",
      primaryGenreName: "Science",
      genres: ["Science", "Education"],
      trackCount: 75,
      releaseDate: "2024-01-20T00:00:00Z",
      country: "USA",
    },
  ],
};

/**
 * Mock response with a podcast that has no feed URL (should be filtered out)
 */
export const MOCK_ITUNES_NO_FEED_RESPONSE: ITunesSearchResponse = {
  resultCount: 2,
  results: [
    {
      trackId: 111111,
      trackName: "Valid Podcast",
      artistName: "Valid Author",
      feedUrl: "https://example.com/valid/feed.xml",
      artworkUrl100: "https://example.com/valid/art100.jpg",
      artworkUrl600: "https://example.com/valid/art600.jpg",
      primaryGenreName: "News",
      genres: ["News"],
      trackCount: 50,
      releaseDate: "2024-01-01T00:00:00Z",
      country: "USA",
    },
    {
      trackId: 222222,
      trackName: "No Feed Podcast",
      artistName: "Missing Feed",
      feedUrl: "", // Empty feed URL - should be filtered
      artworkUrl100: "https://example.com/nofeed/art100.jpg",
      artworkUrl600: "https://example.com/nofeed/art600.jpg",
      primaryGenreName: "Music",
      genres: ["Music"],
      trackCount: 30,
      releaseDate: "2024-01-05T00:00:00Z",
      country: "USA",
    },
  ],
};

/**
 * Mock empty search results
 */
export const MOCK_ITUNES_EMPTY_RESPONSE: ITunesSearchResponse = {
  resultCount: 0,
  results: [],
};

/**
 * Mock single podcast lookup response
 */
export const MOCK_ITUNES_LOOKUP_RESPONSE: ITunesSearchResponse = {
  resultCount: 1,
  results: [
    {
      trackId: 999999,
      trackName: "Specific Podcast",
      artistName: "Specific Author",
      feedUrl: "https://example.com/specific/feed.xml",
      artworkUrl100: "https://example.com/specific/art100.jpg",
      artworkUrl600: "https://example.com/specific/art600.jpg",
      primaryGenreName: "Education",
      genres: ["Education"],
      trackCount: 100,
      releaseDate: "2024-01-10T00:00:00Z",
      country: "USA",
    },
  ],
};
