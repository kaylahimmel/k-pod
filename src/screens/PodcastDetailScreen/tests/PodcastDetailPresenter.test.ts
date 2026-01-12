import { createMockEpisode, createMockPodcast } from "../../../__mocks__";
import {
  formatDuration,
  formatDurationLong,
  formatPublishDate,
  truncateText,
  stripHtml,
  formatEpisodeCount,
  formatEpisode,
  formatEpisodes,
  formatPodcastDetail,
} from "../PodcastDetailPresenter";

// =============================================================================
// formatDuration Tests
// =============================================================================

describe("formatDuration", () => {
  it("should format seconds to MM:SS", () => {
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(125)).toBe("2:05");
  });

  it("should format minutes correctly", () => {
    expect(formatDuration(600)).toBe("10:00");
    expect(formatDuration(1800)).toBe("30:00");
  });

  it("should format hours to HH:MM:SS", () => {
    expect(formatDuration(3600)).toBe("1:00:00");
    expect(formatDuration(3661)).toBe("1:01:01");
    expect(formatDuration(7265)).toBe("2:01:05");
  });

  it("should handle zero and negative values", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(-1)).toBe("0:00");
  });

  it("should handle non-finite values", () => {
    expect(formatDuration(Infinity)).toBe("0:00");
    expect(formatDuration(NaN)).toBe("0:00");
  });

  it("should pad minutes and seconds with zeros", () => {
    expect(formatDuration(61)).toBe("1:01");
    expect(formatDuration(3605)).toBe("1:00:05");
  });
});

// =============================================================================
// formatDurationLong Tests
// =============================================================================

describe("formatDurationLong", () => {
  it("should format minutes only", () => {
    expect(formatDurationLong(300)).toBe("5 min");
    expect(formatDurationLong(1800)).toBe("30 min");
  });

  it("should format hours only", () => {
    expect(formatDurationLong(3600)).toBe("1 hr");
    expect(formatDurationLong(7200)).toBe("2 hr");
  });

  it("should format hours and minutes", () => {
    expect(formatDurationLong(3900)).toBe("1 hr 5 min");
    expect(formatDurationLong(5400)).toBe("1 hr 30 min");
  });

  it("should handle zero and negative values", () => {
    expect(formatDurationLong(0)).toBe("0 min");
    expect(formatDurationLong(-1)).toBe("0 min");
  });
});

// =============================================================================
// formatPublishDate Tests
// =============================================================================

describe("formatPublishDate", () => {
  const now = new Date();

  it("should return 'Today' for today's date", () => {
    expect(formatPublishDate(now.toISOString())).toBe("Today");
  });

  it("should return 'Yesterday' for yesterday's date", () => {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    expect(formatPublishDate(yesterday.toISOString())).toBe("Yesterday");
  });

  it("should return 'X days ago' for dates within a week", () => {
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    expect(formatPublishDate(threeDaysAgo.toISOString())).toBe("3 days ago");
  });

  it("should return weeks for dates within a month", () => {
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    expect(formatPublishDate(twoWeeksAgo.toISOString())).toBe("2 weeks ago");
  });

  it("should return formatted date for older dates", () => {
    const oldDate = new Date("2020-06-15").toISOString();
    const result = formatPublishDate(oldDate);
    expect(result).toContain("2020");
  });
});

// =============================================================================
// truncateText Tests
// =============================================================================

describe("truncateText", () => {
  it("should return original text if shorter than max", () => {
    expect(truncateText("Short", 10)).toBe("Short");
  });

  it("should truncate with ellipsis", () => {
    expect(truncateText("This is a very long text", 10)).toBe("This is a…");
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
// stripHtml Tests
// =============================================================================

describe("stripHtml", () => {
  it("should remove HTML tags", () => {
    expect(stripHtml("<p>Hello</p>")).toBe("Hello");
    expect(stripHtml("<div><span>Test</span></div>")).toBe("Test");
  });

  it("should decode HTML entities", () => {
    expect(stripHtml("Hello&nbsp;World")).toBe("Hello World");
    expect(stripHtml("A &amp; B")).toBe("A & B");
    expect(stripHtml("&lt;tag&gt;")).toBe("<tag>");
    expect(stripHtml("&quot;quoted&quot;")).toBe('"quoted"');
    expect(stripHtml("It&#39;s")).toBe("It's");
  });

  it("should normalize whitespace", () => {
    expect(stripHtml("Hello    World")).toBe("Hello World");
    expect(stripHtml("Hello\n\nWorld")).toBe("Hello World");
  });

  it("should handle empty input", () => {
    expect(stripHtml("")).toBe("");
    expect(stripHtml(null as any)).toBe("");
  });
});

// =============================================================================
// formatEpisodeCount Tests
// =============================================================================

describe("formatEpisodeCount", () => {
  it("should return 'No episodes' for 0", () => {
    expect(formatEpisodeCount(0)).toBe("No episodes");
  });

  it("should return singular for 1", () => {
    expect(formatEpisodeCount(1)).toBe("1 episode");
  });

  it("should return plural for multiple", () => {
    expect(formatEpisodeCount(5)).toBe("5 episodes");
    expect(formatEpisodeCount(100)).toBe("100 episodes");
  });
});

// =============================================================================
// formatEpisode Tests
// =============================================================================

describe("formatEpisode", () => {
  it("should format episode with all fields", () => {
    const episode = createMockEpisode({
      title: "My Episode Title",
      duration: 3665,
      publishDate: new Date().toISOString(),
    });

    const formatted = formatEpisode(episode);

    expect(formatted.id).toBe(episode.id);
    expect(formatted.title).toBe(episode.title);
    expect(formatted.displayTitle).toBe("My Episode Title");
    expect(formatted.formattedDuration).toBe("1:01:05");
    expect(formatted.formattedPublishDate).toBe("Today");
  });

  it("should truncate long titles", () => {
    const episode = createMockEpisode({
      title: "A".repeat(100),
    });

    const formatted = formatEpisode(episode);

    expect(formatted.displayTitle.length).toBeLessThanOrEqual(80);
    expect(formatted.displayTitle.endsWith("…")).toBe(true);
  });

  it("should strip HTML from description", () => {
    const episode = createMockEpisode({
      description: "<p>This is <strong>bold</strong> text</p>",
    });

    const formatted = formatEpisode(episode);

    expect(formatted.description).toBe("This is bold text");
  });

  it("should truncate long descriptions", () => {
    const episode = createMockEpisode({
      description: "A".repeat(200),
    });

    const formatted = formatEpisode(episode);

    expect(formatted.truncatedDescription.length).toBeLessThanOrEqual(150);
  });
});

// =============================================================================
// formatEpisodes Tests
// =============================================================================

describe("formatEpisodes", () => {
  it("should format array of episodes", () => {
    const episodes = [
      createMockEpisode({ id: "1" }),
      createMockEpisode({ id: "2" }),
    ];

    const formatted = formatEpisodes(episodes);

    expect(formatted).toHaveLength(2);
  });

  it("should sort episodes by publish date (newest first)", () => {
    const episodes = [
      createMockEpisode({
        id: "old",
        publishDate: "2024-01-01T00:00:00Z",
      }),
      createMockEpisode({
        id: "new",
        publishDate: "2024-06-01T00:00:00Z",
      }),
    ];

    const formatted = formatEpisodes(episodes);

    expect(formatted[0].id).toBe("new");
    expect(formatted[1].id).toBe("old");
  });

  it("should return empty array for empty input", () => {
    expect(formatEpisodes([])).toEqual([]);
  });
});

// =============================================================================
// formatPodcastDetail Tests
// =============================================================================

describe("formatPodcastDetail", () => {
  it("should format podcast with all fields", () => {
    const podcast = createMockPodcast({
      title: "My Podcast",
      author: "John Doe",
      episodes: [createMockEpisode()],
    });

    const formatted = formatPodcastDetail(podcast);

    expect(formatted.id).toBe(podcast.id);
    expect(formatted.title).toBe(podcast.title);
    expect(formatted.author).toBe(podcast.author);
    expect(formatted.episodeCount).toBe(1);
    expect(formatted.episodeCountLabel).toBe("1 episode");
    expect(formatted.episodes).toHaveLength(1);
  });

  it("should strip HTML from podcast description", () => {
    const podcast = createMockPodcast({
      description: "<p>A <em>great</em> podcast</p>",
    });

    const formatted = formatPodcastDetail(podcast);

    expect(formatted.description).toBe("A great podcast");
  });

  it("should format and sort episodes", () => {
    const podcast = createMockPodcast({
      episodes: [
        createMockEpisode({ id: "1", publishDate: "2024-01-01T00:00:00Z" }),
        createMockEpisode({ id: "2", publishDate: "2024-06-01T00:00:00Z" }),
      ],
    });

    const formatted = formatPodcastDetail(podcast);

    expect(formatted.episodes[0].id).toBe("2"); // Newer first
    expect(formatted.episodes[1].id).toBe("1");
  });
});
