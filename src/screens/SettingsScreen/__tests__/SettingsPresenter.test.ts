import {
  formatListeningTime,
  getInitialsFromEmail,
  formatAccount,
  calculateTotalListeningTime,
  countCompletedEpisodes,
  getListeningStats,
} from '../SettingsPresenter';
import {
  createMockEpisode,
  createMockListeningHistory,
  createMockUser,
} from '../../../__mocks__';

describe('formatListeningTime', () => {
  it("should return '0 min' for 0 seconds", () => {
    expect(formatListeningTime(0)).toBe('0 min');
  });

  it("should return '0 min' for negative seconds", () => {
    expect(formatListeningTime(-10)).toBe('0 min');
  });

  it("should return '0 min' for an unknown (infinite) duration", () => {
    expect(formatListeningTime(Infinity)).toBe('0 min');
    expect(formatListeningTime(NaN)).toBe('0 min');
  });

  it("should return '0 min' for null/undefined", () => {
    expect(formatListeningTime(null as unknown as number)).toBe('0 min');
    expect(formatListeningTime(undefined as unknown as number)).toBe('0 min');
  });

  it('should format minutes only', () => {
    expect(formatListeningTime(300)).toBe('5 min');
    expect(formatListeningTime(2700)).toBe('45 min');
  });

  it('should format hours only when minutes is 0', () => {
    expect(formatListeningTime(3600)).toBe('1h');
    expect(formatListeningTime(7200)).toBe('2h');
  });

  it('should format hours and minutes', () => {
    expect(formatListeningTime(3660)).toBe('1h 1m');
    expect(formatListeningTime(5400)).toBe('1h 30m');
    expect(formatListeningTime(90000)).toBe('25h'); // 25 hours, 0 minutes returns just "25h"
  });
});

describe('getInitialsFromEmail', () => {
  it('should extract initials from email with dot separator', () => {
    expect(getInitialsFromEmail('john.doe@example.com')).toBe('JD');
  });

  it('should extract initials from email with underscore separator', () => {
    expect(getInitialsFromEmail('jane_smith@example.com')).toBe('JS');
  });

  it('should extract initials from email with dash separator', () => {
    expect(getInitialsFromEmail('bob-wilson@example.com')).toBe('BW');
  });

  it('should use first two characters for simple emails', () => {
    expect(getInitialsFromEmail('admin@example.com')).toBe('AD');
    expect(getInitialsFromEmail('xy@example.com')).toBe('XY');
  });
});

describe('calculateTotalListeningTime', () => {
  it('should return 0 for empty history', () => {
    expect(calculateTotalListeningTime([])).toBe(0);
  });

  it('should calculate total based on completion percentage', () => {
    const items = [
      createMockListeningHistory({
        episode: createMockEpisode({ duration: 1000 }),
        completionPercentage: 100,
      }),
      createMockListeningHistory({
        episode: createMockEpisode({ duration: 1000 }),
        completionPercentage: 50,
      }),
    ];

    // 1000 * 1.0 + 1000 * 0.5 = 1500
    expect(calculateTotalListeningTime(items)).toBe(1500);
  });

  it('should handle episodes with no duration', () => {
    const items = [
      createMockListeningHistory({
        episode: createMockEpisode({ duration: 0 }),
        completionPercentage: 100,
      }),
    ];

    expect(calculateTotalListeningTime(items)).toBe(0);
  });
});

describe('countCompletedEpisodes', () => {
  it('should return 0 for empty history', () => {
    expect(countCompletedEpisodes([])).toBe(0);
  });

  it('should count episodes with >= 90% completion', () => {
    const items = [
      createMockListeningHistory({ completionPercentage: 100 }),
      createMockListeningHistory({ completionPercentage: 95 }),
      createMockListeningHistory({ completionPercentage: 90 }),
      createMockListeningHistory({ completionPercentage: 89 }),
      createMockListeningHistory({ completionPercentage: 50 }),
    ];

    expect(countCompletedEpisodes(items)).toBe(3);
  });
});

describe('formatAccount', () => {
  it('should show a placeholder when nobody is signed in', () => {
    expect(formatAccount(null)).toEqual({
      email: 'Not signed in',
      initials: '?',
    });
  });

  it('should use the email and its initials', () => {
    const user = createMockUser({ email: 'john.doe@example.com' });
    expect(formatAccount(user)).toEqual({
      email: 'john.doe@example.com',
      initials: 'JD',
    });
  });
});

describe('getListeningStats', () => {
  it('should return zero stats for empty data', () => {
    expect(getListeningStats([], 0)).toEqual([
      { label: 'Listening Time', value: '0 min' },
      { label: 'Episodes', value: 0 },
      { label: 'Subscribed', value: 0 },
    ]);
  });

  it('should calculate time, completed episodes and subscriptions', () => {
    const history = [
      createMockListeningHistory({
        episode: createMockEpisode({ duration: 3600 }),
        completionPercentage: 100,
      }),
      createMockListeningHistory({
        episode: createMockEpisode({ duration: 3600 }),
        completionPercentage: 50,
      }),
    ];

    expect(getListeningStats(history, 3)).toEqual([
      { label: 'Listening Time', value: '1h 30m' },
      { label: 'Episodes', value: 1 },
      { label: 'Subscribed', value: 3 },
    ]);
  });
});
