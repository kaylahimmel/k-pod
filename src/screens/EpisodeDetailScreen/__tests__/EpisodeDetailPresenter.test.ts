import { formatEpisodeDetail } from '../EpisodeDetailPresenter';
import { createMockEpisode, createMockPodcast } from '../../../__mocks__';

describe('EpisodeDetailPresenter', () => {
  describe('formatEpisodeDetail', () => {
    it('should format episode with podcast details', () => {
      const mockEpisode = createMockEpisode();
      const mockPodcast = createMockPodcast({ episodes: [mockEpisode] });
      const formatted = formatEpisodeDetail(mockEpisode, mockPodcast);

      expect(formatted.id).toBe('episode-1');
      expect(formatted.podcastId).toBe('podcast-1');
      expect(formatted.title).toBe('Test Episode');
      expect(formatted.podcastTitle).toBe('Test Podcast');
      expect(formatted.podcastAuthor).toBe('Test Author');
      expect(formatted.podcastArtworkUrl).toBe(
        'https://example.com/artwork.jpg',
      );
    });

    it('should strip HTML from description', () => {
      const mockEpisode = createMockEpisode({
        description: '<p>This is a <strong>test</strong> description.</p>',
      });
      const mockPodcast = createMockPodcast({ episodes: [mockEpisode] });
      const formatted = formatEpisodeDetail(mockEpisode, mockPodcast);

      expect(formatted.description).not.toContain('<p>');
      expect(formatted.description).not.toContain('<strong>');
      expect(formatted.description).toContain('test');
      expect(formatted.description).toContain('description');
    });

    it('should format duration as HH:MM:SS for long durations', () => {
      const mockEpisode = createMockEpisode({ duration: 3661 }); // 1:01:01
      const mockPodcast = createMockPodcast({ episodes: [mockEpisode] });
      const formatted = formatEpisodeDetail(mockEpisode, mockPodcast);

      expect(formatted.formattedDuration).toBe('1:01:01');
    });

    it('should format duration in long format', () => {
      const mockEpisode = createMockEpisode({ duration: 3661 }); // 1 hr 1 min
      const mockPodcast = createMockPodcast({ episodes: [mockEpisode] });
      const formatted = formatEpisodeDetail(mockEpisode, mockPodcast);

      expect(formatted.formattedDurationLong).toBe('1 hr 1 min');
    });

    it('should format short duration as MM:SS', () => {
      const mockEpisode = createMockEpisode({ duration: 125 }); // 2:05
      const mockPodcast = createMockPodcast({ episodes: [mockEpisode] });
      const formatted = formatEpisodeDetail(mockEpisode, mockPodcast);

      expect(formatted.formattedDuration).toBe('2:05');
      expect(formatted.formattedDurationLong).toBe('2 min');
    });

    it('should format publish date as Today for same day', () => {
      const mockEpisode = createMockEpisode({
        publishDate: new Date().toISOString(),
      });
      const mockPodcast = createMockPodcast({ episodes: [mockEpisode] });
      const formatted = formatEpisodeDetail(mockEpisode, mockPodcast);

      expect(formatted.formattedPublishDate).toBe('Today');
    });

    it('should format publish date as Yesterday for previous day', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const mockEpisode = createMockEpisode({
        publishDate: yesterday.toISOString(),
      });
      const mockPodcast = createMockPodcast({ episodes: [mockEpisode] });
      const formatted = formatEpisodeDetail(mockEpisode, mockPodcast);

      expect(formatted.formattedPublishDate).toBe('Yesterday');
    });

    it('should preserve played status', () => {
      const mockEpisode = createMockEpisode({ played: true });
      const mockPodcast = createMockPodcast({ episodes: [mockEpisode] });
      const formatted = formatEpisodeDetail(mockEpisode, mockPodcast);

      expect(formatted.played).toBe(true);
    });

    it('should preserve audio URL', () => {
      const mockEpisode = createMockEpisode();
      const mockPodcast = createMockPodcast({ episodes: [mockEpisode] });
      const formatted = formatEpisodeDetail(mockEpisode, mockPodcast);

      expect(formatted.audioUrl).toBe('https://example.com/audio.mp3');
    });

    it('should handle empty description', () => {
      const mockEpisode = createMockEpisode({ description: '' });
      const mockPodcast = createMockPodcast({ episodes: [mockEpisode] });
      const formatted = formatEpisodeDetail(mockEpisode, mockPodcast);

      expect(formatted.description).toBe('');
    });

    it('should handle zero duration', () => {
      const mockEpisode = createMockEpisode({ duration: 0 });
      const mockPodcast = createMockPodcast({ episodes: [mockEpisode] });
      const formatted = formatEpisodeDetail(mockEpisode, mockPodcast);

      expect(formatted.formattedDuration).toBe('0:00');
      expect(formatted.formattedDurationLong).toBe('0 min');
    });
  });
});
