import { RSSService } from '../RSSService';
import {
  MOCK_RSS_XML,
  MOCK_SINGLE_EPISODE_RSS,
  MOCK_INVALID_RSS,
  MOCK_COMPLEX_GUID_RSS,
} from '../../__mocks__/mockPodcasts';

// ===========================================
// MOCK SETUP
// ===========================================
// Store original fetch to restore later
const originalFetch = global.fetch;

// Helper to create a mock fetch response
function mockFetchResponse(body: string, ok = true, status = 200) {
  return jest.fn(() =>
    Promise.resolve({
      ok,
      status,
      statusText: ok ? 'OK' : 'Not Found',
      text: () => Promise.resolve(body),
    } as Response),
  );
}

describe('RSSService', () => {
  afterEach(() => {
    // Restore fetch after each test
    global.fetch = originalFetch;
  });

  // -----------------------------------------
  // Helper Function Tests
  // -----------------------------------------
  describe('helper functions', () => {
    describe('parseDuration', () => {
      const { parseDuration } = RSSService._helpers;

      it('should parse HH:MM:SS format', () => {
        expect(parseDuration('1:23:45')).toBe(5025); // 1*3600 + 23*60 + 45
      });

      it('should parse MM:SS format', () => {
        expect(parseDuration('45:30')).toBe(2730); // 45*60 + 30
      });

      it('should parse seconds as string', () => {
        expect(parseDuration('3600')).toBe(3600);
      });

      it('should return 0 for undefined', () => {
        expect(parseDuration(undefined)).toBe(0);
      });

      it('should return 0 for invalid format', () => {
        expect(parseDuration('invalid')).toBe(0);
      });

      it('should parse single number format', () => {
        expect(parseDuration('45')).toBe(45);
      });

      it('should return 0 for invalid time parts with 4+ segments', () => {
        expect(parseDuration('12:34:56:78')).toBe(0);
      });
    });

    describe('generateId', () => {
      const { generateId } = RSSService._helpers;

      it('should generate consistent IDs for same input', () => {
        const id1 = generateId('test-input');
        const id2 = generateId('test-input');
        expect(id1).toBe(id2);
      });

      it('should generate different IDs for different inputs', () => {
        const id1 = generateId('input-1');
        const id2 = generateId('input-2');
        expect(id1).not.toBe(id2);
      });
    });

    describe('normalizeItems', () => {
      const { normalizeItems } = RSSService._helpers;

      it('should return empty array for undefined', () => {
        expect(normalizeItems(undefined)).toEqual([]);
      });

      it('should wrap single item in array', () => {
        const item = { title: 'Single' };
        expect(normalizeItems(item)).toEqual([item]);
      });

      it('should return array as-is', () => {
        const items = [{ title: 'First' }, { title: 'Second' }];
        expect(normalizeItems(items)).toEqual(items);
      });
    });

    describe('extractGuid', () => {
      const { extractGuid } = RSSService._helpers;

      it('should extract string GUID', () => {
        expect(extractGuid({ guid: 'simple-guid' })).toBe('simple-guid');
      });

      it('should extract GUID from object format', () => {
        expect(extractGuid({ guid: { '#text': 'complex-guid' } })).toBe(
          'complex-guid',
        );
      });

      it('should return empty string for missing GUID', () => {
        expect(extractGuid({})).toBe('');
      });
    });

    describe('extractAudioUrl', () => {
      const { extractAudioUrl } = RSSService._helpers;

      it('should extract URL from enclosure', () => {
        const item = {
          enclosure: { '@_url': 'https://example.com/audio.mp3' },
        };
        expect(extractAudioUrl(item)).toBe('https://example.com/audio.mp3');
      });

      it('should return empty string for missing enclosure', () => {
        expect(extractAudioUrl({})).toBe('');
      });
    });
  });

  // -----------------------------------------
  // Feed Parsing Tests
  // -----------------------------------------
  describe('fetchAndParseFeed', () => {
    it('should successfully parse valid RSS feed', async () => {
      global.fetch = mockFetchResponse(MOCK_RSS_XML);

      const result = await RSSService.fetchAndParseFeed(
        'https://example.com/feed.xml',
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rss.channel.title).toBe('Test Podcast');
      }
    });

    it('should return error for invalid RSS', async () => {
      global.fetch = mockFetchResponse(MOCK_INVALID_RSS);

      const result = await RSSService.fetchAndParseFeed(
        'https://example.com/invalid.xml',
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid RSS feed');
      }
    });

    it('should return error for failed HTTP request', async () => {
      global.fetch = mockFetchResponse('Not Found', false, 404);

      const result = await RSSService.fetchAndParseFeed(
        'https://example.com/missing.xml',
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('404');
      }
    });

    it('should handle network errors', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

      const result = await RSSService.fetchAndParseFeed(
        'https://example.com/feed.xml',
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Network error');
      }
    });
  });

  // -----------------------------------------
  // Podcast Transformation Tests
  // -----------------------------------------
  describe('transformPodcastFromRSS', () => {
    it('should transform RSS feed into Podcast object', async () => {
      global.fetch = mockFetchResponse(MOCK_RSS_XML);

      const result = await RSSService.transformPodcastFromRSS(
        'https://example.com/feed.xml',
      );

      expect(result.success).toBe(true);
      if (result.success) {
        const podcast = result.data;

        expect(podcast.title).toBe('Test Podcast');
        expect(podcast.author).toBe('Test Author');
        expect(podcast.description).toBe('A podcast for testing');
        expect(podcast.artworkUrl).toBe('https://example.com/artwork.jpg');
        expect(podcast.rssUrl).toBe('https://example.com/feed.xml');
        expect(podcast.episodes).toHaveLength(2);
      }
    });

    it('should correctly parse episode data', async () => {
      global.fetch = mockFetchResponse(MOCK_RSS_XML);

      const result = await RSSService.transformPodcastFromRSS(
        'https://example.com/feed.xml',
      );

      expect(result.success).toBe(true);
      if (result.success) {
        const episode = result.data.episodes[0];

        expect(episode.id).toBe('episode-1-guid');
        expect(episode.title).toBe('Episode 1');
        expect(episode.description).toBe('First episode description');
        expect(episode.audioUrl).toBe('https://example.com/ep1.mp3');
        expect(episode.duration).toBe(5025); // 1:23:45 in seconds
        expect(episode.played).toBe(false);
      }
    });

    it('should handle single episode feeds', async () => {
      global.fetch = mockFetchResponse(MOCK_SINGLE_EPISODE_RSS);

      const result = await RSSService.transformPodcastFromRSS(
        'https://example.com/single.xml',
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.episodes).toHaveLength(1);
        expect(result.data.episodes[0].title).toBe('Only Episode');
      }
    });

    it('should handle complex GUID format', async () => {
      global.fetch = mockFetchResponse(MOCK_COMPLEX_GUID_RSS);

      const result = await RSSService.transformPodcastFromRSS(
        'https://example.com/complex.xml',
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.episodes[0].id).toBe('complex-guid-value');
      }
    });
  });

  // -----------------------------------------
  // Refresh Episodes Tests
  // -----------------------------------------
  describe('refreshEpisodes', () => {
    it('should return episodes with updated podcastId', async () => {
      global.fetch = mockFetchResponse(MOCK_RSS_XML);

      const result = await RSSService.refreshEpisodes(
        'custom-podcast-id',
        'https://example.com/feed.xml',
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0].podcastId).toBe('custom-podcast-id');
        expect(result.data[1].podcastId).toBe('custom-podcast-id');
      }
    });

    it('should return error when feed fetch fails', async () => {
      global.fetch = mockFetchResponse('Not Found', false, 404);

      const result = await RSSService.refreshEpisodes(
        'podcast-id',
        'https://example.com/missing.xml',
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('404');
      }
    });
  });
});
