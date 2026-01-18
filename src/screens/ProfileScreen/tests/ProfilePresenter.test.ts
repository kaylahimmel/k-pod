import {
  createMockUser,
  createMockListeningHistory,
  createMockListeningHistoryItems,
  createMockPodcast,
  createMockEpisode,
  createMockPodcasts,
} from '../../../__mocks__';
import {
  formatListeningTime,
  formatRelativeDate,
  formatCompletionPercentage,
  getInitialsFromEmail,
  formatUser,
  formatHistoryItem,
  formatHistoryItems,
  getRecentHistory,
  calculateTotalListeningTime,
  countCompletedEpisodes,
  formatCountLabel,
  getProfileStats,
} from '../ProfilePresenter';

describe('formatListeningTime', () => {
  it("should return '0 min' for 0 seconds", () => {
    expect(formatListeningTime(0)).toBe('0 min');
  });

  it("should return '0 min' for negative seconds", () => {
    expect(formatListeningTime(-10)).toBe('0 min');
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

describe('formatRelativeDate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-20T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return 'Today' for same day", () => {
    expect(formatRelativeDate(new Date('2024-01-20T08:00:00Z'))).toBe('Today');
  });

  it("should return 'Yesterday' for previous day", () => {
    expect(formatRelativeDate(new Date('2024-01-19T12:00:00Z'))).toBe(
      'Yesterday',
    );
  });

  it("should return 'X days ago' for recent dates", () => {
    expect(formatRelativeDate(new Date('2024-01-17T12:00:00Z'))).toBe(
      '3 days ago',
    );
    expect(formatRelativeDate(new Date('2024-01-15T12:00:00Z'))).toBe(
      '5 days ago',
    );
  });

  it('should return formatted date for older dates', () => {
    expect(formatRelativeDate(new Date('2024-01-10T12:00:00Z'))).toBe('Jan 10');
    expect(formatRelativeDate(new Date('2023-12-15T12:00:00Z'))).toBe('Dec 15');
  });

  it('should handle string dates', () => {
    expect(formatRelativeDate('2024-01-20T08:00:00Z')).toBe('Today');
  });
});

describe('formatCompletionPercentage', () => {
  it("should return 'Completed' for 100%", () => {
    expect(formatCompletionPercentage(100)).toBe('Completed');
  });

  it("should return 'Completed' for over 100%", () => {
    expect(formatCompletionPercentage(105)).toBe('Completed');
  });

  it('should return percentage for partial completion', () => {
    expect(formatCompletionPercentage(75)).toBe('75% listened');
    expect(formatCompletionPercentage(50)).toBe('50% listened');
  });

  it('should round percentages', () => {
    expect(formatCompletionPercentage(75.6)).toBe('76% listened');
    expect(formatCompletionPercentage(33.3)).toBe('33% listened');
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

describe('formatUser', () => {
  it('should return null for null user', () => {
    expect(formatUser(null)).toBeNull();
  });

  it('should format user with all fields', () => {
    const user = createMockUser({
      id: 'user-1',
      email: 'john.doe@example.com',
      preferences: { theme: 'dark', notifications: false },
    });

    const formatted = formatUser(user);

    expect(formatted).not.toBeNull();
    expect(formatted?.id).toBe('user-1');
    expect(formatted?.email).toBe('john.doe@example.com');
    expect(formatted?.displayEmail).toBe('john.doe@example.com');
    expect(formatted?.initials).toBe('JD');
    expect(formatted?.theme).toBe('dark');
    expect(formatted?.notificationsEnabled).toBe(false);
  });
});

describe('formatHistoryItem', () => {
  it('should format history item with all fields', () => {
    const history = createMockListeningHistory({
      podcast: createMockPodcast({
        title: 'Test Podcast',
        artworkUrl: 'https://example.com/art.jpg',
      }),
      episode: createMockEpisode({
        id: 'ep-1',
        title: 'Test Episode',
      }),
      completionPercentage: 85,
    });

    const formatted = formatHistoryItem(history, 0);

    expect(formatted.id).toBe('ep-1-0');
    expect(formatted.episodeTitle).toBe('Test Episode');
    expect(formatted.podcastTitle).toBe('Test Podcast');
    expect(formatted.podcastArtworkUrl).toBe('https://example.com/art.jpg');
    expect(formatted.completionPercentage).toBe(85);
    expect(formatted.formattedCompletionPercentage).toBe('85% listened');
  });

  it('should truncate long episode titles', () => {
    const history = createMockListeningHistory({
      episode: createMockEpisode({
        title: 'A'.repeat(60),
      }),
    });

    const formatted = formatHistoryItem(history, 0);

    expect(formatted.displayTitle.length).toBeLessThanOrEqual(51);
    expect(formatted.displayTitle.endsWith('…')).toBe(true);
  });
});

describe('formatHistoryItems', () => {
  it('should format array of history items', () => {
    const items = createMockListeningHistoryItems(3);
    const formatted = formatHistoryItems(items);

    expect(formatted).toHaveLength(3);
    expect(formatted[0].id).toContain('-0');
    expect(formatted[1].id).toContain('-1');
    expect(formatted[2].id).toContain('-2');
  });

  it('should return empty array for empty input', () => {
    expect(formatHistoryItems([])).toEqual([]);
  });
});

describe('getRecentHistory', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-20T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return most recent items', () => {
    const items = [
      createMockListeningHistory({
        episode: createMockEpisode({ id: 'old', title: 'Old Episode' }),
        completedAt: new Date('2024-01-10T12:00:00Z'),
      }),
      createMockListeningHistory({
        episode: createMockEpisode({ id: 'new', title: 'New Episode' }),
        completedAt: new Date('2024-01-19T12:00:00Z'),
      }),
      createMockListeningHistory({
        episode: createMockEpisode({ id: 'mid', title: 'Mid Episode' }),
        completedAt: new Date('2024-01-15T12:00:00Z'),
      }),
    ];

    const recent = getRecentHistory(items, 2);

    expect(recent).toHaveLength(2);
    expect(recent[0].episodeTitle).toBe('New Episode');
    expect(recent[1].episodeTitle).toBe('Mid Episode');
  });

  it('should default to 3 items', () => {
    const items = createMockListeningHistoryItems(5);
    const recent = getRecentHistory(items);

    expect(recent).toHaveLength(3);
  });

  it('should return all items if less than limit', () => {
    const items = createMockListeningHistoryItems(2);
    const recent = getRecentHistory(items, 5);

    expect(recent).toHaveLength(2);
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

describe('formatCountLabel', () => {
  it('should return singular for count of 1', () => {
    expect(formatCountLabel(1, 'Episode', 'Episodes')).toBe('1 Episode');
    expect(formatCountLabel(1, 'Podcast', 'Podcasts')).toBe('1 Podcast');
  });

  it('should return plural for count other than 1', () => {
    expect(formatCountLabel(0, 'Episode', 'Episodes')).toBe('0 Episodes');
    expect(formatCountLabel(5, 'Episode', 'Episodes')).toBe('5 Episodes');
    expect(formatCountLabel(100, 'Podcast', 'Podcasts')).toBe('100 Podcasts');
  });
});

describe('getProfileStats', () => {
  it('should return zero stats for empty data', () => {
    const stats = getProfileStats([], []);

    expect(stats.totalListeningTime).toBe('0 min');
    expect(stats.episodesCompleted).toBe(0);
    expect(stats.episodesCompletedLabel).toBe('0 Episodes');
    expect(stats.podcastsSubscribed).toBe(0);
    expect(stats.podcastsSubscribedLabel).toBe('0 Podcasts');
  });

  it('should calculate correct stats', () => {
    const history = [
      createMockListeningHistory({
        episode: createMockEpisode({ duration: 3600 }),
        completionPercentage: 100,
      }),
      createMockListeningHistory({
        episode: createMockEpisode({ duration: 1800 }),
        completionPercentage: 100,
      }),
    ];
    const podcasts = createMockPodcasts(3);

    const stats = getProfileStats(history, podcasts);

    expect(stats.totalListeningTime).toBe('1h 30m');
    expect(stats.episodesCompleted).toBe(2);
    expect(stats.episodesCompletedLabel).toBe('2 Episodes');
    expect(stats.podcastsSubscribed).toBe(3);
    expect(stats.podcastsSubscribedLabel).toBe('3 Podcasts');
  });

  it('should handle singular labels', () => {
    const history = [createMockListeningHistory({ completionPercentage: 100 })];
    const podcasts = [createMockPodcast()];

    const stats = getProfileStats(history, podcasts);

    expect(stats.episodesCompletedLabel).toBe('1 Episode');
    expect(stats.podcastsSubscribedLabel).toBe('1 Podcast');
  });
});
