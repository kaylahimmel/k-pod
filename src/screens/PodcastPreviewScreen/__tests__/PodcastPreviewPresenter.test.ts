import {
  formatDuration,
  formatPublishDate,
  formatEpisodeCount,
  formatPreviewEpisode,
  formatPreviewEpisodes,
  formatPodcastPreview,
  isSubscribed,
} from '../PodcastPreviewPresenter';
import {
  createMockDiscoveryPodcast,
  createMockEpisode,
} from '../../../__mocks__';

describe('PodcastPreviewPresenter', () => {
  describe('formatDuration', () => {
    it('should return "0:00" for zero or negative seconds', () => {
      expect(formatDuration(0)).toBe('0:00');
      expect(formatDuration(-10)).toBe('0:00');
    });

    it('should format seconds to MM:SS format', () => {
      expect(formatDuration(65)).toBe('1:05');
      expect(formatDuration(600)).toBe('10:00');
    });

    it('should format to HH:MM:SS for durations over an hour', () => {
      expect(formatDuration(3665)).toBe('1:01:05');
      expect(formatDuration(7200)).toBe('2:00:00');
    });

    it('should handle NaN and Infinity', () => {
      expect(formatDuration(NaN)).toBe('0:00');
      expect(formatDuration(Infinity)).toBe('0:00');
    });
  });

  describe('formatPublishDate', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "Today" for today', () => {
      expect(formatPublishDate('2024-06-15T10:00:00Z')).toBe('Today');
    });

    it('should return "Yesterday" for yesterday', () => {
      expect(formatPublishDate('2024-06-14T10:00:00Z')).toBe('Yesterday');
    });

    it('should return days ago for less than a week', () => {
      expect(formatPublishDate('2024-06-12T10:00:00Z')).toBe('3 days ago');
    });

    it('should return weeks ago for less than a month', () => {
      expect(formatPublishDate('2024-06-01T10:00:00Z')).toBe('2 weeks ago');
      expect(formatPublishDate('2024-06-08T10:00:00Z')).toBe('1 week ago');
    });

    it('should return formatted date for older dates', () => {
      const result = formatPublishDate('2024-01-15T10:00:00Z');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
    });

    it('should include year for dates from previous years', () => {
      const result = formatPublishDate('2023-06-15T10:00:00Z');
      expect(result).toContain('2023');
    });
  });

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

  describe('formatPreviewEpisode', () => {
    it('should format an episode into preview format', () => {
      const mockEpisode = createMockEpisode({
        id: 'ep-1',
        title: 'Test Episode',
        description: 'Test description',
        duration: 3600,
        publishDate: '2024-06-15T10:00:00Z',
      });

      const result = formatPreviewEpisode(mockEpisode);

      expect(result.id).toBe('ep-1');
      expect(result.title).toBe('Test Episode');
      expect(result.displayTitle).toBe('Test Episode');
      expect(result.formattedDuration).toBe('1:00:00');
    });

    it('should truncate long titles', () => {
      const longTitle =
        'This is a very long episode title that should be truncated because it exceeds the maximum length allowed for display';
      const mockEpisode = createMockEpisode({ title: longTitle });

      const result = formatPreviewEpisode(mockEpisode);

      expect(result.title).toBe(longTitle);
      expect(result.displayTitle.length).toBeLessThanOrEqual(80);
    });

    it('should strip HTML from description', () => {
      const mockEpisode = createMockEpisode({
        description: '<p>Test <strong>description</strong></p>',
      });

      const result = formatPreviewEpisode(mockEpisode);

      expect(result.description).not.toContain('<p>');
      expect(result.description).not.toContain('<strong>');
    });
  });

  describe('formatPreviewEpisodes', () => {
    it('should format and limit episodes to 5 by default', () => {
      const episodes = Array.from({ length: 10 }, (_, i) =>
        createMockEpisode({
          id: `ep-${i}`,
          publishDate: new Date(2024, 5, 15 - i).toISOString(),
        }),
      );

      const result = formatPreviewEpisodes(episodes);

      expect(result).toHaveLength(5);
    });

    it('should sort episodes by publish date (newest first)', () => {
      const episodes = [
        createMockEpisode({ id: 'old', publishDate: '2024-01-01T00:00:00Z' }),
        createMockEpisode({ id: 'new', publishDate: '2024-06-15T00:00:00Z' }),
        createMockEpisode({ id: 'mid', publishDate: '2024-03-01T00:00:00Z' }),
      ];

      const result = formatPreviewEpisodes(episodes);

      expect(result[0].id).toBe('new');
      expect(result[1].id).toBe('mid');
      expect(result[2].id).toBe('old');
    });

    it('should respect custom limit', () => {
      const episodes = Array.from({ length: 10 }, (_, i) =>
        createMockEpisode({ id: `ep-${i}` }),
      );

      const result = formatPreviewEpisodes(episodes, 3);

      expect(result).toHaveLength(3);
    });

    it('should return empty array for empty input', () => {
      const result = formatPreviewEpisodes([]);
      expect(result).toEqual([]);
    });
  });

  describe('formatPodcastPreview', () => {
    it('should format a discovery podcast into preview format', () => {
      const mockPodcast = createMockDiscoveryPodcast({
        id: 'podcast-1',
        title: 'Test Podcast',
        author: 'Test Author',
        feedUrl: 'https://example.com/feed.xml',
        artworkUrl: 'https://example.com/art.jpg',
        genre: 'Technology',
        episodeCount: 50,
        description: 'A great podcast about tech',
      });

      const result = formatPodcastPreview(mockPodcast);

      expect(result.id).toBe('podcast-1');
      expect(result.title).toBe('Test Podcast');
      expect(result.displayTitle).toBe('Test Podcast');
      expect(result.author).toBe('Test Author');
      expect(result.feedUrl).toBe('https://example.com/feed.xml');
      expect(result.artworkUrl).toBe('https://example.com/art.jpg');
      expect(result.genre).toBe('Technology');
      expect(result.episodeCount).toBe(50);
      expect(result.episodeCountLabel).toBe('50 episodes');
      expect(result.description).toBe('A great podcast about tech');
    });

    it('should truncate long titles', () => {
      const longTitle =
        'This is a very long podcast title that should be truncated because it exceeds the maximum length';
      const mockPodcast = createMockDiscoveryPodcast({ title: longTitle });

      const result = formatPodcastPreview(mockPodcast);

      expect(result.title).toBe(longTitle);
      expect(result.displayTitle.length).toBeLessThanOrEqual(60);
    });

    it('should handle missing description', () => {
      const mockPodcast = createMockDiscoveryPodcast({
        description: undefined,
      });

      const result = formatPodcastPreview(mockPodcast);

      expect(result.description).toBe('');
      expect(result.truncatedDescription).toBe('');
    });

    it('should strip HTML from description', () => {
      const mockPodcast = createMockDiscoveryPodcast({
        description: '<p>Test <strong>podcast</strong> description</p>',
      });

      const result = formatPodcastPreview(mockPodcast);

      expect(result.description).not.toContain('<p>');
      expect(result.description).not.toContain('<strong>');
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
});
