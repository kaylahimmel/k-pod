import {
  formatEpisodeCount,
  formatSearchResult,
  formatSearchResults,
  isSubscribed,
  formatResultsHeader,
} from '../SearchResultsPresenter';
import { createMockDiscoveryPodcast } from '../../../__mocks__';

describe('SearchResultsPresenter', () => {
  describe('formatEpisodeCount', () => {
    it('should return "No episodes" for count of 0', () => {
      expect(formatEpisodeCount(0)).toBe('No episodes');
    });

    it('should return "1 episode" for count of 1', () => {
      expect(formatEpisodeCount(1)).toBe('1 episode');
    });

    it('should return plural format for count greater than 1', () => {
      expect(formatEpisodeCount(5)).toBe('5 episodes');
      expect(formatEpisodeCount(100)).toBe('100 episodes');
    });
  });

  describe('formatSearchResult', () => {
    it('should format a discovery podcast into a search result', () => {
      const mockPodcast = createMockDiscoveryPodcast({
        id: 'test-id',
        title: 'Test Podcast',
        author: 'Test Author',
        feedUrl: 'https://example.com/feed.xml',
        artworkUrl: 'https://example.com/art.jpg',
        genre: 'Technology',
        episodeCount: 50,
      });

      const result = formatSearchResult(mockPodcast);

      expect(result.id).toBe('test-id');
      expect(result.title).toBe('Test Podcast');
      expect(result.displayTitle).toBe('Test Podcast');
      expect(result.author).toBe('Test Author');
      expect(result.feedUrl).toBe('https://example.com/feed.xml');
      expect(result.artworkUrl).toBe('https://example.com/art.jpg');
      expect(result.genre).toBe('Technology');
      expect(result.episodeCount).toBe(50);
      expect(result.episodeCountLabel).toBe('50 episodes');
    });

    it('should truncate long titles', () => {
      const longTitle =
        'This is a very long podcast title that should be truncated because it exceeds the maximum length';
      const mockPodcast = createMockDiscoveryPodcast({
        title: longTitle,
      });

      const result = formatSearchResult(mockPodcast);

      expect(result.title).toBe(longTitle);
      expect(result.displayTitle.length).toBeLessThanOrEqual(50);
      expect(result.displayTitle).toContain('…'); // Unicode ellipsis
    });
  });

  describe('formatSearchResults', () => {
    it('should format an array of podcasts', () => {
      const mockPodcasts = [
        createMockDiscoveryPodcast({ id: '1', title: 'Podcast 1' }),
        createMockDiscoveryPodcast({ id: '2', title: 'Podcast 2' }),
        createMockDiscoveryPodcast({ id: '3', title: 'Podcast 3' }),
      ];

      const results = formatSearchResults(mockPodcasts);

      expect(results).toHaveLength(3);
      expect(results[0].id).toBe('1');
      expect(results[1].id).toBe('2');
      expect(results[2].id).toBe('3');
    });

    it('should return empty array for empty input', () => {
      const results = formatSearchResults([]);
      expect(results).toEqual([]);
    });
  });

  describe('isSubscribed', () => {
    it('should return true when feed URL is in subscribed list', () => {
      const subscribedUrls = [
        'https://example.com/feed1.xml',
        'https://example.com/feed2.xml',
      ];

      expect(
        isSubscribed('https://example.com/feed1.xml', subscribedUrls),
      ).toBe(true);
    });

    it('should return false when feed URL is not in subscribed list', () => {
      const subscribedUrls = [
        'https://example.com/feed1.xml',
        'https://example.com/feed2.xml',
      ];

      expect(
        isSubscribed('https://example.com/other.xml', subscribedUrls),
      ).toBe(false);
    });

    it('should be case-insensitive', () => {
      const subscribedUrls = ['https://EXAMPLE.com/FEED.xml'];

      expect(isSubscribed('https://example.com/feed.xml', subscribedUrls)).toBe(
        true,
      );
    });

    it('should return false for empty subscribed list', () => {
      expect(isSubscribed('https://example.com/feed.xml', [])).toBe(false);
    });
  });

  describe('formatResultsHeader', () => {
    it('should return no results message for count of 0', () => {
      expect(formatResultsHeader('test', 0)).toBe('No results for "test"');
    });

    it('should return singular message for count of 1', () => {
      expect(formatResultsHeader('test', 1)).toBe('1 result for "test"');
    });

    it('should return plural message for count greater than 1', () => {
      expect(formatResultsHeader('test', 5)).toBe('5 results for "test"');
      expect(formatResultsHeader('podcasts', 25)).toBe(
        '25 results for "podcasts"',
      );
    });
  });
});
