import {
  validateRSSUrl,
  normalizeUrl,
  formatErrorMessage,
  formatPodcastPreview,
  formatEpisodeCount,
} from '../AddPodcastPresenter';
import { createMockPodcast, createMockEpisode } from '../../../__mocks__';

describe('AddPodcastPresenter', () => {
  describe('validateRSSUrl', () => {
    it('should return error for empty URL', () => {
      const result = validateRSSUrl('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter an RSS feed URL');
    });

    it('should return error for whitespace-only URL', () => {
      const result = validateRSSUrl('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter an RSS feed URL');
    });

    it('should return error for invalid URL format', () => {
      const result = validateRSSUrl('not-a-url');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid URL');
    });

    it('should return error for non-http(s) protocols', () => {
      const result = validateRSSUrl('ftp://example.com/feed.xml');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('URL must start with http:// or https://');
    });

    it('should return valid for http URL', () => {
      const result = validateRSSUrl('http://example.com/feed.xml');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should return valid for https URL', () => {
      const result = validateRSSUrl('https://example.com/feed.xml');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle URLs with whitespace', () => {
      const result = validateRSSUrl('  https://example.com/feed.xml  ');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('normalizeUrl', () => {
    it('should trim whitespace', () => {
      expect(normalizeUrl('  https://example.com/feed.xml  ')).toBe(
        'https://example.com/feed.xml',
      );
    });

    it('should return empty string for empty input', () => {
      expect(normalizeUrl('')).toBe('');
    });
  });

  describe('formatErrorMessage', () => {
    it('should format invalid RSS feed error', () => {
      const result = formatErrorMessage(
        'Invalid RSS feed: missing channel element',
      );
      expect(result).toBe('This URL does not appear to be a valid RSS feed');
    });

    it('should format 404 error', () => {
      const result = formatErrorMessage('Failed to fetch feed: 404 Not Found');
      expect(result).toBe('Feed not found. Please check the URL and try again');
    });

    it('should format 403 error', () => {
      const result = formatErrorMessage('Failed to fetch feed: 403 Forbidden');
      expect(result).toBe('Access to this feed is restricted');
    });

    it('should format 500 error', () => {
      const result = formatErrorMessage(
        'Failed to fetch feed: 500 Internal Server Error',
      );
      expect(result).toBe(
        'The podcast server is having issues. Try again later',
      );
    });

    it('should format network error', () => {
      const result = formatErrorMessage('Network request failed');
      expect(result).toBe(
        'Unable to connect. Please check your internet connection',
      );
    });

    it('should format RSS parsing error', () => {
      const result = formatErrorMessage('RSS parsing failed: invalid XML');
      expect(result).toBe(
        'Unable to parse RSS feed. The feed format may be invalid',
      );
    });

    it('should format unknown HTTP errors with status code', () => {
      const result = formatErrorMessage('Failed to fetch feed: 502');
      expect(result).toBe('Unable to load feed (Error 502)');
    });

    it('should return generic message for unknown errors', () => {
      const result = formatErrorMessage('Some unknown error occurred');
      expect(result).toBe('Something went wrong. Please try again');
    });
  });

  describe('formatPodcastPreview', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should format podcast with episodes', () => {
      const mockPodcast = createMockPodcast({
        title: 'Test Podcast',
        author: 'Test Author',
        description: 'A test podcast description',
        artworkUrl: 'https://example.com/artwork.jpg',
        episodes: [
          createMockEpisode({
            id: 'ep-1',
            publishDate: '2024-06-15T10:00:00Z',
          }),
          createMockEpisode({
            id: 'ep-2',
            publishDate: '2024-06-14T10:00:00Z',
          }),
        ],
      });

      const result = formatPodcastPreview(mockPodcast);

      expect(result.title).toBe('Test Podcast');
      expect(result.author).toBe('Test Author');
      expect(result.description).toBe('A test podcast description');
      expect(result.artworkUrl).toBe('https://example.com/artwork.jpg');
      expect(result.episodeCount).toBe(2);
      expect(result.latestEpisodeDate).toBe('Today');
    });

    it('should return "No episodes" for podcast with no episodes', () => {
      const mockPodcast = createMockPodcast({
        episodes: [],
      });

      const result = formatPodcastPreview(mockPodcast);

      expect(result.episodeCount).toBe(0);
      expect(result.latestEpisodeDate).toBe('No episodes');
    });

    it('should truncate long descriptions', () => {
      const longDescription =
        'This is a very long podcast description that should be truncated because it exceeds the maximum length allowed for display in the preview. We want to show users just enough information to help them decide if they want to subscribe.';

      const mockPodcast = createMockPodcast({
        description: longDescription,
      });

      const result = formatPodcastPreview(mockPodcast);

      expect(result.description.length).toBeLessThanOrEqual(153); // 150 + "..."
      expect(result.description.endsWith('...')).toBe(true);
    });

    it('should not truncate short descriptions', () => {
      const shortDescription = 'A short description';

      const mockPodcast = createMockPodcast({
        description: shortDescription,
      });

      const result = formatPodcastPreview(mockPodcast);

      expect(result.description).toBe(shortDescription);
      expect(result.description.endsWith('...')).toBe(false);
    });
  });

  describe('formatEpisodeCount', () => {
    it('should return "No episodes" for 0', () => {
      expect(formatEpisodeCount(0)).toBe('No episodes');
    });

    it('should return "1 episode" for 1', () => {
      expect(formatEpisodeCount(1)).toBe('1 episode');
    });

    it('should return plural for more than 1', () => {
      expect(formatEpisodeCount(5)).toBe('5 episodes');
      expect(formatEpisodeCount(100)).toBe('100 episodes');
    });
  });
});
