import { formatEpisodeCount, formatDuration } from '../formatUtils';

describe('formatEpisodeCount', () => {
  it('should say "No episodes" for zero', () => {
    expect(formatEpisodeCount(0)).toBe('No episodes');
  });

  it('should use the singular for one', () => {
    expect(formatEpisodeCount(1)).toBe('1 episode');
  });

  it('should use the plural for many', () => {
    expect(formatEpisodeCount(42)).toBe('42 episodes');
  });
});

describe('formatDuration', () => {
  it('should format under an hour as M:SS', () => {
    expect(formatDuration(90)).toBe('1:30');
  });

  it('should pad seconds', () => {
    expect(formatDuration(65)).toBe('1:05');
  });

  it('should format an hour or more as H:MM:SS', () => {
    expect(formatDuration(3661)).toBe('1:01:01');
  });

  it('should return 0:00 for zero and negatives', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(-5)).toBe('0:00');
  });

  it('should return 0:00 for Infinity rather than "Infinity:NaN:NaN"', () => {
    // QueuePresenter guarded with `!seconds || seconds <= 0`, which Infinity
    // passes, and FullPlayer's formatTime had the same hole
    expect(formatDuration(Infinity)).toBe('0:00');
  });

  it('should return 0:00 for NaN', () => {
    expect(formatDuration(NaN)).toBe('0:00');
  });
});
