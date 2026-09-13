import {
  formatCompletedEpisodes,
  getCompletedSummary,
} from '../CompletedEpisodesPresenter';
import {
  createMockListeningHistory,
  createMockPodcast,
  createMockEpisode,
} from '../../../__mocks__';

const entry = (podcastId: string, episodeId: string, completedAt: string) =>
  createMockListeningHistory({
    podcast: createMockPodcast({ id: podcastId }),
    episode: createMockEpisode({ id: episodeId }),
    completedAt,
  });

describe('CompletedEpisodesPresenter', () => {
  describe('formatCompletedEpisodes', () => {
    it('should only include entries for the requested podcast', () => {
      const history = [
        entry('podcast-1', 'ep-1', '2024-01-10T12:00:00.000Z'),
        entry('podcast-2', 'ep-2', '2024-01-11T12:00:00.000Z'),
      ];

      const result = formatCompletedEpisodes(history, 'podcast-1');

      expect(result).toHaveLength(1);
      expect(result[0].episodeTitle).toBe('Test Episode');
    });

    it('should sort most recently completed first', () => {
      const history = [
        entry('podcast-1', 'older', '2024-01-01T12:00:00.000Z'),
        entry('podcast-1', 'newer', '2024-01-20T12:00:00.000Z'),
      ];

      const result = formatCompletedEpisodes(history, 'podcast-1');

      expect(result[0].completedAt).toBe('2024-01-20T12:00:00.000Z');
      expect(result[1].completedAt).toBe('2024-01-01T12:00:00.000Z');
    });

    it('should return an empty list when the podcast has nothing completed', () => {
      const history = [entry('podcast-2', 'ep-1', '2024-01-10T12:00:00.000Z')];

      expect(formatCompletedEpisodes(history, 'podcast-1')).toEqual([]);
    });

    it('should give each item a unique id even for repeated episodes', () => {
      const history = [
        entry('podcast-1', 'ep-1', '2024-01-10T12:00:00.000Z'),
        entry('podcast-1', 'ep-1', '2024-01-11T12:00:00.000Z'),
      ];

      const result = formatCompletedEpisodes(history, 'podcast-1');

      expect(result[0].id).not.toBe(result[1].id);
    });
  });

  describe('getCompletedSummary', () => {
    it('should handle zero, one and many', () => {
      expect(getCompletedSummary(0)).toBe('No completed episodes yet');
      expect(getCompletedSummary(1)).toBe('1 completed episode');
      expect(getCompletedSummary(4)).toBe('4 completed episodes');
    });
  });
});
