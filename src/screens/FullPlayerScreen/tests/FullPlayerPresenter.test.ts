import {
  formatTime,
  formatRemainingTime,
  calculateProgress,
  formatPlaybackTime,
  formatSpeedDisplay,
  formatUpNextItem,
  getNextQueueItem,
  formatSpeedLabel,
  calculateSeekPosition,
} from '../FullPlayerPresenter';
import { createMockQueueItem, createMockQueueItems } from '../../../__mocks__';

describe('FullPlayerPresenter', () => {
  describe('formatTime', () => {
    it('should format seconds to MM:SS for short durations', () => {
      expect(formatTime(65)).toBe('1:05');
      expect(formatTime(125)).toBe('2:05');
      expect(formatTime(0)).toBe('0:00');
    });

    it('should format seconds to HH:MM:SS for long durations', () => {
      expect(formatTime(3661)).toBe('1:01:01');
      expect(formatTime(7325)).toBe('2:02:05');
    });

    it('should handle negative or invalid values', () => {
      expect(formatTime(-10)).toBe('0:00');
      expect(formatTime(NaN)).toBe('0:00');
    });

    it('should pad minutes and seconds correctly', () => {
      expect(formatTime(61)).toBe('1:01');
      expect(formatTime(3601)).toBe('1:00:01');
    });
  });

  describe('formatRemainingTime', () => {
    it('should format remaining time with minus prefix', () => {
      expect(formatRemainingTime(60, 300)).toBe('-4:00');
      expect(formatRemainingTime(0, 125)).toBe('-2:05');
    });

    it('should return -0:00 when position equals duration', () => {
      expect(formatRemainingTime(300, 300)).toBe('-0:00');
    });

    it('should handle when position exceeds duration', () => {
      expect(formatRemainingTime(350, 300)).toBe('-0:00');
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress as a value between 0 and 1', () => {
      expect(calculateProgress(50, 100)).toBe(0.5);
      expect(calculateProgress(0, 100)).toBe(0);
      expect(calculateProgress(100, 100)).toBe(1);
    });

    it('should return 0 for zero or invalid duration', () => {
      expect(calculateProgress(50, 0)).toBe(0);
      expect(calculateProgress(50, -10)).toBe(0);
    });

    it('should clamp progress to 0-1 range', () => {
      expect(calculateProgress(150, 100)).toBe(1);
      expect(calculateProgress(-10, 100)).toBe(0);
    });
  });

  describe('formatPlaybackTime', () => {
    it('should return formatted playback time object', () => {
      const result = formatPlaybackTime(60, 300);

      expect(result.current).toBe('1:00');
      expect(result.remaining).toBe('-4:00');
      expect(result.total).toBe('5:00');
      expect(result.progress).toBe(0.2);
    });

    it('should handle zero values', () => {
      const result = formatPlaybackTime(0, 0);

      expect(result.current).toBe('0:00');
      expect(result.remaining).toBe('-0:00');
      expect(result.total).toBe('0:00');
      expect(result.progress).toBe(0);
    });
  });

  describe('formatSpeedDisplay', () => {
    it('should format speed 1 as "1x"', () => {
      const result = formatSpeedDisplay(1);
      expect(result.label).toBe('1x');
      expect(result.value).toBe(1);
    });

    it('should format other speeds with x suffix', () => {
      expect(formatSpeedDisplay(0.5).label).toBe('0.5x');
      expect(formatSpeedDisplay(1.5).label).toBe('1.5x');
      expect(formatSpeedDisplay(2).label).toBe('2x');
    });
  });

  describe('formatUpNextItem', () => {
    it('should format queue item for up next display', () => {
      const queueItem = createMockQueueItem();
      const result = formatUpNextItem(queueItem);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(queueItem.id);
      expect(result?.episodeTitle).toBe(queueItem.episode.title);
      expect(result?.podcastTitle).toBe(queueItem.podcast.title);
      expect(result?.artworkUrl).toBe(queueItem.podcast.artworkUrl);
    });

    it('should return null for null input', () => {
      expect(formatUpNextItem(null)).toBeNull();
    });
  });

  describe('getNextQueueItem', () => {
    it('should return the next item after current index', () => {
      const queue = createMockQueueItems(3);
      const result = getNextQueueItem(queue, 0);

      expect(result).toBe(queue[1]);
    });

    it('should return null when at the last item', () => {
      const queue = createMockQueueItems(3);
      const result = getNextQueueItem(queue, 2);

      expect(result).toBeNull();
    });

    it('should return null for empty queue', () => {
      expect(getNextQueueItem([], 0)).toBeNull();
    });

    it('should return null when index is out of bounds', () => {
      const queue = createMockQueueItems(3);
      expect(getNextQueueItem(queue, 5)).toBeNull();
    });
  });

  describe('formatSpeedLabel', () => {
    it('should format speed 1 as "1x"', () => {
      expect(formatSpeedLabel(1)).toBe('1x');
    });

    it('should format other speeds with x suffix', () => {
      expect(formatSpeedLabel(0.5)).toBe('0.5x');
      expect(formatSpeedLabel(1.5)).toBe('1.5x');
    });
  });

  describe('calculateSeekPosition', () => {
    it('should convert slider value to seek position', () => {
      expect(calculateSeekPosition(0.5, 300)).toBe(150);
      expect(calculateSeekPosition(0, 300)).toBe(0);
      expect(calculateSeekPosition(1, 300)).toBe(300);
    });

    it('should floor the result', () => {
      expect(calculateSeekPosition(0.333, 100)).toBe(33);
    });
  });
});
