import {
  createMockEpisode,
  createMockPodcast,
  createMockQueueItem,
} from "../../../__mocks__";
import {
  formatDuration,
  calculateRemainingTime,
  formatRemainingTime,
  truncateText,
  formatPositionLabel,
  formatQueueItem,
  formatQueueItems,
  getCurrentlyPlayingItem,
  getUpcomingItems,
  formatQueueCount,
  getQueueStats,
} from "../QueuePresenter";

// =============================================================================
// formatDuration Tests
// =============================================================================

describe("formatDuration", () => {
  it("should return 0:00 for 0 seconds", () => {
    expect(formatDuration(0)).toBe("0:00");
  });

  it("should return 0:00 for negative seconds", () => {
    expect(formatDuration(-10)).toBe("0:00");
  });

  it("should return 0:00 for null/undefined", () => {
    expect(formatDuration(null as any)).toBe("0:00");
    expect(formatDuration(undefined as any)).toBe("0:00");
  });

  it("should format seconds only", () => {
    expect(formatDuration(45)).toBe("0:45");
  });

  it("should format minutes and seconds", () => {
    expect(formatDuration(125)).toBe("2:05");
    expect(formatDuration(600)).toBe("10:00");
  });

  it("should format hours, minutes, and seconds", () => {
    expect(formatDuration(3661)).toBe("1:01:01");
    expect(formatDuration(7200)).toBe("2:00:00");
    expect(formatDuration(3723)).toBe("1:02:03");
  });

  it("should pad minutes and seconds with zeros", () => {
    expect(formatDuration(3605)).toBe("1:00:05");
    expect(formatDuration(3660)).toBe("1:01:00");
  });
});

// =============================================================================
// calculateRemainingTime Tests
// =============================================================================

describe("calculateRemainingTime", () => {
  it("should return 0 for empty queue", () => {
    expect(calculateRemainingTime([], 0)).toBe(0);
  });

  it("should calculate total duration from given index", () => {
    const queue = [
      createMockQueueItem({ episode: createMockEpisode({ duration: 100 }) }),
      createMockQueueItem({ episode: createMockEpisode({ duration: 200 }) }),
      createMockQueueItem({ episode: createMockEpisode({ duration: 300 }) }),
    ];

    expect(calculateRemainingTime(queue, 0)).toBe(600);
    expect(calculateRemainingTime(queue, 1)).toBe(500);
    expect(calculateRemainingTime(queue, 2)).toBe(300);
  });

  it("should return 0 when index is beyond queue length", () => {
    const queue = [createMockQueueItem()];
    expect(calculateRemainingTime(queue, 5)).toBe(0);
  });

  it("should handle episodes with no duration", () => {
    const queue = [
      createMockQueueItem({ episode: createMockEpisode({ duration: 0 }) }),
      createMockQueueItem({ episode: createMockEpisode({ duration: 100 }) }),
    ];

    expect(calculateRemainingTime(queue, 0)).toBe(100);
  });
});

// =============================================================================
// formatRemainingTime Tests
// =============================================================================

describe("formatRemainingTime", () => {
  it("should return 'No time remaining' for 0 seconds", () => {
    expect(formatRemainingTime(0)).toBe("No time remaining");
  });

  it("should return 'No time remaining' for negative seconds", () => {
    expect(formatRemainingTime(-10)).toBe("No time remaining");
  });

  it("should format minutes only", () => {
    expect(formatRemainingTime(300)).toBe("5m remaining");
    expect(formatRemainingTime(60)).toBe("1m remaining");
  });

  it("should format hours and minutes", () => {
    expect(formatRemainingTime(3660)).toBe("1h 1m remaining");
    expect(formatRemainingTime(7200)).toBe("2h 0m remaining");
  });
});

// =============================================================================
// truncateText Tests
// =============================================================================

describe("truncateText", () => {
  it("should return original text if shorter than max length", () => {
    expect(truncateText("Short", 10)).toBe("Short");
  });

  it("should truncate text with ellipsis", () => {
    expect(truncateText("This is a very long text", 10)).toBe("This is a…");
  });

  it("should handle text exactly at max length", () => {
    expect(truncateText("Exactly10!", 10)).toBe("Exactly10!");
  });

  it("should handle empty string", () => {
    expect(truncateText("", 10)).toBe("");
  });

  it("should handle null/undefined", () => {
    expect(truncateText(null as any, 10)).toBe("");
    expect(truncateText(undefined as any, 10)).toBe("");
  });
});

// =============================================================================
// formatPositionLabel Tests
// =============================================================================

describe("formatPositionLabel", () => {
  it("should return 'Now Playing' for currently playing item", () => {
    expect(formatPositionLabel(0, true)).toBe("Now Playing");
    expect(formatPositionLabel(5, true)).toBe("Now Playing");
  });

  it("should return 1-indexed position for non-playing items", () => {
    expect(formatPositionLabel(0, false)).toBe("#1");
    expect(formatPositionLabel(1, false)).toBe("#2");
    expect(formatPositionLabel(9, false)).toBe("#10");
  });
});

// =============================================================================
// formatQueueItem Tests
// =============================================================================

describe("formatQueueItem", () => {
  it("should format queue item with all fields", () => {
    const item = createMockQueueItem({
      id: "q1",
      episode: createMockEpisode({
        id: "e1",
        title: "Episode Title",
        duration: 1800,
      }),
      podcast: createMockPodcast({
        title: "Podcast Title",
        artworkUrl: "https://example.com/art.jpg",
      }),
    });

    const formatted = formatQueueItem(item, 0, 0);

    expect(formatted.id).toBe("q1");
    expect(formatted.episodeId).toBe("e1");
    expect(formatted.episodeTitle).toBe("Episode Title");
    expect(formatted.displayTitle).toBe("Episode Title");
    expect(formatted.podcastTitle).toBe("Podcast Title");
    expect(formatted.podcastArtworkUrl).toBe("https://example.com/art.jpg");
    expect(formatted.duration).toBe(1800);
    expect(formatted.formattedDuration).toBe("30:00");
    expect(formatted.position).toBe(0);
    expect(formatted.positionLabel).toBe("Now Playing");
  });

  it("should truncate long episode titles", () => {
    const item = createMockQueueItem({
      episode: createMockEpisode({
        title: "A".repeat(70),
      }),
    });

    const formatted = formatQueueItem(item, 0, 0);

    expect(formatted.displayTitle.length).toBeLessThanOrEqual(60);
    expect(formatted.displayTitle.endsWith("…")).toBe(true);
  });

  it("should show position label for non-playing items", () => {
    const item = createMockQueueItem();

    const formatted = formatQueueItem(item, 2, 0);

    expect(formatted.positionLabel).toBe("#3");
  });
});

// =============================================================================
// formatQueueItems Tests
// =============================================================================

describe("formatQueueItems", () => {
  it("should format array of queue items", () => {
    const queue = [
      createMockQueueItem({ id: "q1" }),
      createMockQueueItem({ id: "q2" }),
      createMockQueueItem({ id: "q3" }),
    ];

    const formatted = formatQueueItems(queue, 0);

    expect(formatted).toHaveLength(3);
    expect(formatted[0].id).toBe("q1");
    expect(formatted[0].positionLabel).toBe("Now Playing");
    expect(formatted[1].id).toBe("q2");
    expect(formatted[1].positionLabel).toBe("#2");
    expect(formatted[2].id).toBe("q3");
    expect(formatted[2].positionLabel).toBe("#3");
  });

  it("should return empty array for empty queue", () => {
    expect(formatQueueItems([], 0)).toEqual([]);
  });

  it("should mark correct item as currently playing", () => {
    const queue = [
      createMockQueueItem({ id: "q1" }),
      createMockQueueItem({ id: "q2" }),
    ];

    const formatted = formatQueueItems(queue, 1);

    expect(formatted[0].positionLabel).toBe("#1");
    expect(formatted[1].positionLabel).toBe("Now Playing");
  });
});

// =============================================================================
// getCurrentlyPlayingItem Tests
// =============================================================================

describe("getCurrentlyPlayingItem", () => {
  it("should return null for empty queue", () => {
    expect(getCurrentlyPlayingItem([], 0)).toBeNull();
  });

  it("should return null when currentIndex is out of bounds", () => {
    const queue = [createMockQueueItem()];
    expect(getCurrentlyPlayingItem(queue, 5)).toBeNull();
  });

  it("should return formatted currently playing item", () => {
    const queue = [
      createMockQueueItem({ id: "q1" }),
      createMockQueueItem({ id: "q2" }),
    ];

    const current = getCurrentlyPlayingItem(queue, 1);

    expect(current).not.toBeNull();
    expect(current?.id).toBe("q2");
    expect(current?.positionLabel).toBe("Now Playing");
  });
});

// =============================================================================
// getUpcomingItems Tests
// =============================================================================

describe("getUpcomingItems", () => {
  it("should return empty array for empty queue", () => {
    expect(getUpcomingItems([], 0)).toEqual([]);
  });

  it("should return empty array when no upcoming items", () => {
    const queue = [createMockQueueItem()];
    expect(getUpcomingItems(queue, 0)).toEqual([]);
  });

  it("should return all items after currentIndex", () => {
    const queue = [
      createMockQueueItem({ id: "q1" }),
      createMockQueueItem({ id: "q2" }),
      createMockQueueItem({ id: "q3" }),
    ];

    const upcoming = getUpcomingItems(queue, 0);

    expect(upcoming).toHaveLength(2);
    expect(upcoming[0].id).toBe("q2");
    expect(upcoming[1].id).toBe("q3");
  });

  it("should assign correct position labels", () => {
    const queue = [
      createMockQueueItem({ id: "q1" }),
      createMockQueueItem({ id: "q2" }),
      createMockQueueItem({ id: "q3" }),
    ];

    const upcoming = getUpcomingItems(queue, 0);

    expect(upcoming[0].positionLabel).toBe("#2");
    expect(upcoming[1].positionLabel).toBe("#3");
  });
});

// =============================================================================
// formatQueueCount Tests
// =============================================================================

describe("formatQueueCount", () => {
  it("should return 'Queue is empty' for 0", () => {
    expect(formatQueueCount(0)).toBe("Queue is empty");
  });

  it("should return singular for 1", () => {
    expect(formatQueueCount(1)).toBe("1 episode");
  });

  it("should return plural for multiple", () => {
    expect(formatQueueCount(5)).toBe("5 episodes");
    expect(formatQueueCount(100)).toBe("100 episodes");
  });
});

// =============================================================================
// getQueueStats Tests
// =============================================================================

describe("getQueueStats", () => {
  it("should return empty stats for empty queue", () => {
    const stats = getQueueStats([], 0);

    expect(stats.count).toBe("Queue is empty");
    expect(stats.remainingTime).toBe("No time remaining");
  });

  it("should calculate stats for queue with items", () => {
    const queue = [
      createMockQueueItem({ episode: createMockEpisode({ duration: 1800 }) }),
      createMockQueueItem({ episode: createMockEpisode({ duration: 1800 }) }),
      createMockQueueItem({ episode: createMockEpisode({ duration: 1800 }) }),
    ];

    const stats = getQueueStats(queue, 0);

    expect(stats.count).toBe("2 episodes");
    // 2 upcoming items x 1800s = 3600s = 1 hour
    expect(stats.remainingTime).toBe("1h 0m remaining");
  });

  it("should only count upcoming items (not currently playing)", () => {
    const queue = [
      createMockQueueItem({ episode: createMockEpisode({ duration: 3600 }) }),
      createMockQueueItem({ episode: createMockEpisode({ duration: 1800 }) }),
    ];

    const stats = getQueueStats(queue, 0);

    expect(stats.count).toBe("1 episode");
    expect(stats.remainingTime).toBe("30m remaining");
  });

  it("should handle last item in queue", () => {
    const queue = [
      createMockQueueItem({ episode: createMockEpisode({ duration: 1800 }) }),
    ];

    const stats = getQueueStats(queue, 0);

    expect(stats.count).toBe("Queue is empty");
    expect(stats.remainingTime).toBe("No time remaining");
  });
});
