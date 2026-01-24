import {
  createMockListeningHistory,
  createMockListeningHistoryItems,
  createMockPodcast,
  createMockEpisode,
} from '../../../__mocks__';
import {
  formatHistoryItemForList,
  formatAllHistory,
  extractEpisodeIdFromHistoryItem,
  getHistorySummary,
} from '../ListeningHistoryPresenter';

describe('formatHistoryItemForList', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-20T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

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
      completedAt: new Date('2024-01-19T12:00:00Z'),
    });

    const formatted = formatHistoryItemForList(history, 0);

    expect(formatted.id).toBe('ep-1-0');
    expect(formatted.episodeTitle).toBe('Test Episode');
    expect(formatted.podcastTitle).toBe('Test Podcast');
    expect(formatted.podcastArtworkUrl).toBe('https://example.com/art.jpg');
    expect(formatted.completionPercentage).toBe(85);
    expect(formatted.formattedCompletionPercentage).toBe('85% listened');
    expect(formatted.formattedCompletedAt).toBe('Yesterday');
  });

  it('should truncate long episode titles', () => {
    const history = createMockListeningHistory({
      episode: createMockEpisode({
        title: 'A'.repeat(60),
      }),
    });

    const formatted = formatHistoryItemForList(history, 0);

    expect(formatted.displayTitle.length).toBeLessThanOrEqual(51);
    expect(formatted.displayTitle.endsWith('…')).toBe(true);
  });

  it('should handle completed episodes', () => {
    const history = createMockListeningHistory({
      completionPercentage: 100,
    });

    const formatted = formatHistoryItemForList(history, 0);

    expect(formatted.formattedCompletionPercentage).toBe('Completed');
  });
});

describe('formatAllHistory', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-20T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should sort history items by date (most recent first)', () => {
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

    const formatted = formatAllHistory(items);

    expect(formatted).toHaveLength(3);
    expect(formatted[0].episodeTitle).toBe('New Episode');
    expect(formatted[1].episodeTitle).toBe('Mid Episode');
    expect(formatted[2].episodeTitle).toBe('Old Episode');
  });

  it('should return empty array for empty input', () => {
    expect(formatAllHistory([])).toEqual([]);
  });

  it('should format all items correctly', () => {
    const items = createMockListeningHistoryItems(3);
    const formatted = formatAllHistory(items);

    expect(formatted).toHaveLength(3);
    formatted.forEach((item) => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('episodeTitle');
      expect(item).toHaveProperty('podcastTitle');
      expect(item).toHaveProperty('formattedCompletedAt');
      expect(item).toHaveProperty('formattedCompletionPercentage');
    });
  });
});

describe('extractEpisodeIdFromHistoryItem', () => {
  it('should extract episode ID from formatted item', () => {
    const history = createMockListeningHistory({
      episode: createMockEpisode({ id: 'episode-123' }),
    });
    const formatted = formatHistoryItemForList(history, 5);

    const episodeId = extractEpisodeIdFromHistoryItem(formatted);

    expect(episodeId).toBe('episode-123');
  });

  it('should handle episode IDs with dashes', () => {
    const history = createMockListeningHistory({
      episode: createMockEpisode({ id: 'ep-with-many-dashes' }),
    });
    const formatted = formatHistoryItemForList(history, 0);

    const episodeId = extractEpisodeIdFromHistoryItem(formatted);

    expect(episodeId).toBe('ep-with-many-dashes');
  });
});

describe('getHistorySummary', () => {
  it('should return correct message for 0 items', () => {
    expect(getHistorySummary(0)).toBe('No episodes listened yet');
  });

  it('should return singular message for 1 item', () => {
    expect(getHistorySummary(1)).toBe('1 episode in history');
  });

  it('should return plural message for multiple items', () => {
    expect(getHistorySummary(5)).toBe('5 episodes in history');
    expect(getHistorySummary(100)).toBe('100 episodes in history');
  });
});
