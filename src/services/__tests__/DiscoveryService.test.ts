import { DiscoveryService } from '../DiscoveryService';
import {
  MOCK_ITUNES_SEARCH_RESPONSE,
  MOCK_ITUNES_NO_FEED_RESPONSE,
  MOCK_ITUNES_EMPTY_RESPONSE,
  MOCK_ITUNES_LOOKUP_RESPONSE,
} from '../../__mocks__/mockDiscovery';

// ===========================================
// MOCK SETUP
// ===========================================
const originalFetch = global.fetch;

// Helper to create a mock fetch JSON response
function mockFetchJsonResponse(body: object, ok = true, status = 200) {
  return jest.fn(() =>
    Promise.resolve({
      ok,
      status,
      statusText: ok ? 'OK' : 'Error',
      json: () => Promise.resolve(body),
    } as Response),
  );
}

describe('DiscoveryService', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  // -----------------------------------------
  // Helper Function Tests
  // -----------------------------------------
  describe('helper functions', () => {
    describe('transformToDiscoveryPodcast', () => {
      const { transformToDiscoveryPodcast } = DiscoveryService._helpers;

      it('should transform iTunes podcast to DiscoveryPodcast', () => {
        const iTunesPodcast = MOCK_ITUNES_SEARCH_RESPONSE.results[0];
        const result = transformToDiscoveryPodcast(iTunesPodcast);

        expect(result.id).toBe('123456');
        expect(result.title).toBe('Tech Talk Daily');
        expect(result.author).toBe('Jane Developer');
        expect(result.feedUrl).toBe('https://example.com/techtalk/feed.xml');
        expect(result.artworkUrl).toBe(
          'https://example.com/techtalk/art600.jpg',
        );
        expect(result.genre).toBe('Technology');
        expect(result.episodeCount).toBe(150);
      });

      it('should prefer artworkUrl600 over artworkUrl100', () => {
        const { transformToDiscoveryPodcast } = DiscoveryService._helpers;
        const podcast = {
          ...MOCK_ITUNES_SEARCH_RESPONSE.results[0],
          artworkUrl600: 'https://example.com/high-res.jpg',
          artworkUrl100: 'https://example.com/low-res.jpg',
        };

        const result = transformToDiscoveryPodcast(podcast);
        expect(result.artworkUrl).toBe('https://example.com/high-res.jpg');
      });

      it('should fallback to artworkUrl100 when artworkUrl600 is empty', () => {
        const { transformToDiscoveryPodcast } = DiscoveryService._helpers;
        const podcast = {
          ...MOCK_ITUNES_SEARCH_RESPONSE.results[0],
          artworkUrl600: '',
          artworkUrl100: 'https://example.com/low-res.jpg',
        };

        const result = transformToDiscoveryPodcast(podcast);
        expect(result.artworkUrl).toBe('https://example.com/low-res.jpg');
      });
    });

    describe('filterValidPodcasts', () => {
      const { filterValidPodcasts } = DiscoveryService._helpers;

      it('should filter out podcasts without feed URLs', () => {
        const results = MOCK_ITUNES_NO_FEED_RESPONSE.results;
        const filtered = filterValidPodcasts(results);

        expect(filtered).toHaveLength(1);
        expect(filtered[0].trackName).toBe('Valid Podcast');
      });

      it('should keep all podcasts with valid feed URLs', () => {
        const results = MOCK_ITUNES_SEARCH_RESPONSE.results;
        const filtered = filterValidPodcasts(results);

        expect(filtered).toHaveLength(3);
      });
    });

    describe('buildSearchUrl', () => {
      const { buildSearchUrl } = DiscoveryService._helpers;

      it('should build URL with all parameters', () => {
        const url = buildSearchUrl({
          term: 'tech',
          media: 'podcast',
          limit: 10,
        });

        expect(url).toContain('term=tech');
        expect(url).toContain('media=podcast');
        expect(url).toContain('limit=10');
      });
    });
  });

  // -----------------------------------------
  // Search Tests
  // -----------------------------------------
  describe('searchPodcasts', () => {
    it('should return podcasts for valid search query', async () => {
      global.fetch = mockFetchJsonResponse(MOCK_ITUNES_SEARCH_RESPONSE);

      const result = await DiscoveryService.searchPodcasts({ query: 'tech' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(3);
        expect(result.data[0].title).toBe('Tech Talk Daily');
      }
    });

    it('should return error for empty query', async () => {
      const result = await DiscoveryService.searchPodcasts({ query: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Search query is required');
      }
    });

    it('should return error for whitespace-only query', async () => {
      const result = await DiscoveryService.searchPodcasts({ query: '   ' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Search query is required');
      }
    });

    it('should filter out podcasts without feed URLs', async () => {
      global.fetch = mockFetchJsonResponse(MOCK_ITUNES_NO_FEED_RESPONSE);

      const result = await DiscoveryService.searchPodcasts({ query: 'test' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].title).toBe('Valid Podcast');
      }
    });

    it('should return empty array for no results', async () => {
      global.fetch = mockFetchJsonResponse(MOCK_ITUNES_EMPTY_RESPONSE);

      const result = await DiscoveryService.searchPodcasts({
        query: 'nonexistent',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(0);
      }
    });

    it('should handle HTTP errors', async () => {
      global.fetch = mockFetchJsonResponse({}, false, 500);

      const result = await DiscoveryService.searchPodcasts({ query: 'test' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('500');
      }
    });

    it('should handle network errors', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

      const result = await DiscoveryService.searchPodcasts({ query: 'test' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Network error');
      }
    });

    it('should handle non-Error exceptions', async () => {
      global.fetch = jest.fn(() => Promise.reject('Unknown failure'));

      const result = await DiscoveryService.searchPodcasts({ query: 'test' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Unknown error');
      }
    });

    it('should use custom limit when provided', async () => {
      global.fetch = mockFetchJsonResponse(MOCK_ITUNES_SEARCH_RESPONSE);

      await DiscoveryService.searchPodcasts({ query: 'test', limit: 10 });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
      );
    });
  });

  // -----------------------------------------
  // Trending Tests
  // -----------------------------------------
  describe('getTrendingPodcasts', () => {
    it('should return trending podcasts', async () => {
      global.fetch = mockFetchJsonResponse(MOCK_ITUNES_SEARCH_RESPONSE);

      const result = await DiscoveryService.getTrendingPodcasts();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(3);
      }
    });

    it('should filter by genre when provided', async () => {
      global.fetch = mockFetchJsonResponse(MOCK_ITUNES_SEARCH_RESPONSE);

      await DiscoveryService.getTrendingPodcasts('TECHNOLOGY');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('genreId=1318'),
      );
    });

    it('should handle HTTP errors', async () => {
      global.fetch = mockFetchJsonResponse({}, false, 503);

      const result = await DiscoveryService.getTrendingPodcasts();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('503');
      }
    });

    it('should handle non-Error exceptions', async () => {
      global.fetch = jest.fn(() => Promise.reject('Network failure'));

      const result = await DiscoveryService.getTrendingPodcasts();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Unknown error');
      }
    });
  });

  // -----------------------------------------
  // Recommendations Tests
  // -----------------------------------------
  describe('getRecommendations', () => {
    it('should return recommendations based on genres', async () => {
      global.fetch = mockFetchJsonResponse(MOCK_ITUNES_SEARCH_RESPONSE);

      const result = await DiscoveryService.getRecommendations([
        'Technology',
        'Science',
      ]);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBeGreaterThan(0);
      }
    });

    it('should return trending podcasts when no genres provided', async () => {
      global.fetch = mockFetchJsonResponse(MOCK_ITUNES_SEARCH_RESPONSE);

      const result = await DiscoveryService.getRecommendations([]);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(3);
      }
    });

    it('should deduplicate results from multiple genres', async () => {
      // Mock returns same results for both genre searches
      global.fetch = mockFetchJsonResponse(MOCK_ITUNES_SEARCH_RESPONSE);

      const result = await DiscoveryService.getRecommendations([
        'Technology',
        'Technology', // Duplicate genre
      ]);

      expect(result.success).toBe(true);
      if (result.success) {
        // Should only have unique podcasts
        const ids = result.data.map((p) => p.id);
        const uniqueIds = [...new Set(ids)];
        expect(ids.length).toBe(uniqueIds.length);
      }
    });

    it('should handle non-Error exceptions', async () => {
      global.fetch = jest.fn(() => Promise.reject('Unexpected error'));

      const result = await DiscoveryService.getRecommendations([
        'Technology',
        'Science',
      ]);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Unknown error');
      }
    });
  });

  // -----------------------------------------
  // Lookup Tests
  // -----------------------------------------
  describe('getPodcastById', () => {
    it('should return podcast for valid ID', async () => {
      global.fetch = mockFetchJsonResponse(MOCK_ITUNES_LOOKUP_RESPONSE);

      const result = await DiscoveryService.getPodcastById('999999');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('999999');
        expect(result.data.title).toBe('Specific Podcast');
      }
    });

    it('should return error for non-existent podcast', async () => {
      global.fetch = mockFetchJsonResponse(MOCK_ITUNES_EMPTY_RESPONSE);

      const result = await DiscoveryService.getPodcastById('nonexistent');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Podcast not found');
      }
    });

    it('should return error for podcast without feed URL', async () => {
      const noFeedResponse = {
        resultCount: 1,
        results: [{ ...MOCK_ITUNES_LOOKUP_RESPONSE.results[0], feedUrl: '' }],
      };
      global.fetch = mockFetchJsonResponse(noFeedResponse);

      const result = await DiscoveryService.getPodcastById('123');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('no RSS feed');
      }
    });

    it('should handle HTTP errors', async () => {
      global.fetch = mockFetchJsonResponse({}, false, 404);

      const result = await DiscoveryService.getPodcastById('123');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('404');
      }
    });

    it('should handle non-Error exceptions', async () => {
      global.fetch = jest.fn(() => Promise.reject('Lookup failed'));

      const result = await DiscoveryService.getPodcastById('123');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Unknown error');
      }
    });
  });
});
