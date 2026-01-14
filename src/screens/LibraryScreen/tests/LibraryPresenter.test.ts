import { createMockPodcast } from "../../../__mocks__";
import {
  formatRelativeDate,
  formatEpisodeCount,
  formatPodcast,
  formatPodcasts,
  sortPodcasts,
  filterPodcasts,
  preparePodcastsForDisplay,
} from "../LibraryPresenter";
import { truncateText } from "../../../utils";

describe("truncateText", () => {
  it("should return the original text if shorter than maxLength", () => {
    expect(truncateText("Short", 10)).toBe("Short");
  });

  it("should return the original text if equal to maxLength", () => {
    expect(truncateText("Exactly10!", 10)).toBe("Exactly10!");
  });

  it("should truncate text with ellipsis if longer than maxLength", () => {
    expect(truncateText("This is a very long title", 10)).toBe("This is a…");
  });

  it("should handle empty strings", () => {
    expect(truncateText("", 10)).toBe("");
  });

  it("should trim whitespace before adding ellipsis", () => {
    expect(truncateText("Hello    World", 7)).toBe("Hello…");
  });
});

describe("formatRelativeDate", () => {
  const now = new Date();

  it("should return 'Today' for today's date", () => {
    const today = new Date().toISOString();
    expect(formatRelativeDate(today)).toBe("Today");
  });

  it("should return 'Yesterday' for yesterday's date", () => {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(yesterday.toISOString())).toBe("Yesterday");
  });

  it("should return 'X days ago' for dates within a week", () => {
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(threeDaysAgo.toISOString())).toBe("3 days ago");
  });

  it("should return '1 week ago' for dates exactly one week old", () => {
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(oneWeekAgo.toISOString())).toBe("1 week ago");
  });

  it("should return 'X weeks ago' for dates within a month", () => {
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(twoWeeksAgo.toISOString())).toBe("2 weeks ago");
  });

  it("should return '1 month ago' for dates around one month old", () => {
    const oneMonthAgo = new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(oneMonthAgo.toISOString())).toBe("1 month ago");
  });

  it("should return formatted date for dates older than a year", () => {
    const oldDate = new Date("2020-06-15").toISOString();
    const result = formatRelativeDate(oldDate);
    expect(result).toContain("2020");
  });
});

describe("formatEpisodeCount", () => {
  it("should return 'No episodes' for 0 episodes", () => {
    expect(formatEpisodeCount(0)).toBe("No episodes");
  });

  it("should return '1 episode' for 1 episode (singular)", () => {
    expect(formatEpisodeCount(1)).toBe("1 episode");
  });

  it("should return 'X episodes' for multiple episodes (plural)", () => {
    expect(formatEpisodeCount(5)).toBe("5 episodes");
    expect(formatEpisodeCount(100)).toBe("100 episodes");
  });
});

describe("formatPodcast", () => {
  it("should transform podcast to formatted podcast", () => {
    const podcast = createMockPodcast({
      title: "My Amazing Podcast",
      subscribeDate: new Date().toISOString(),
      episodes: [
        {
          id: "1",
          podcastId: "podcast-1",
          title: "Episode 1",
          description: "",
          audioUrl: "",
          duration: 3600,
          publishDate: new Date().toISOString(),
          played: false,
        },
      ],
    });

    const formatted = formatPodcast(podcast);

    expect(formatted.id).toBe(podcast.id);
    expect(formatted.title).toBe(podcast.title);
    expect(formatted.displayTitle).toBe("My Amazing Podcast");
    expect(formatted.author).toBe(podcast.author);
    expect(formatted.artworkUrl).toBe(podcast.artworkUrl);
    expect(formatted.episodeCount).toBe(1);
    expect(formatted.episodeCountLabel).toBe("1 episode");
    expect(formatted.formattedSubscribeDate).toBe("Today");
  });

  it("should truncate long titles", () => {
    const podcast = createMockPodcast({
      title:
        "This Is An Extremely Long Podcast Title That Should Be Truncated For Display",
    });

    const formatted = formatPodcast(podcast);

    expect(formatted.displayTitle.length).toBeLessThanOrEqual(40);
    expect(formatted.displayTitle.endsWith("…")).toBe(true);
  });
});

describe("formatPodcasts", () => {
  it("should format an array of podcasts", () => {
    const podcasts = [
      createMockPodcast({ id: "1", title: "Podcast 1" }),
      createMockPodcast({ id: "2", title: "Podcast 2" }),
    ];

    const formatted = formatPodcasts(podcasts);

    expect(formatted).toHaveLength(2);
    expect(formatted[0].id).toBe("1");
    expect(formatted[1].id).toBe("2");
  });

  it("should return empty array for empty input", () => {
    expect(formatPodcasts([])).toEqual([]);
  });
});

describe("sortPodcasts", () => {
  const podcasts = [
    createMockPodcast({
      id: "1",
      title: "Zebra Podcast",
      subscribeDate: "2024-01-01T00:00:00Z",
      episodes: [{} as any, {} as any],
    }),
    createMockPodcast({
      id: "2",
      title: "Alpha Podcast",
      subscribeDate: "2024-06-01T00:00:00Z",
      episodes: [{} as any],
    }),
    createMockPodcast({
      id: "3",
      title: "Beta Podcast",
      subscribeDate: "2024-03-01T00:00:00Z",
      episodes: [{} as any, {} as any, {} as any],
    }),
  ];

  it("should sort by recent subscription date (newest first)", () => {
    const sorted = sortPodcasts(podcasts, "recent");

    expect(sorted[0].id).toBe("2"); // June (newest)
    expect(sorted[1].id).toBe("3"); // March
    expect(sorted[2].id).toBe("1"); // January (oldest)
  });

  it("should sort alphabetically by title", () => {
    const sorted = sortPodcasts(podcasts, "alphabetical");

    expect(sorted[0].title).toBe("Alpha Podcast");
    expect(sorted[1].title).toBe("Beta Podcast");
    expect(sorted[2].title).toBe("Zebra Podcast");
  });

  it("should sort by episode count (most episodes first)", () => {
    const sorted = sortPodcasts(podcasts, "episodeCount");

    expect(sorted[0].id).toBe("3"); // 3 episodes
    expect(sorted[1].id).toBe("1"); // 2 episodes
    expect(sorted[2].id).toBe("2"); // 1 episode
  });

  it("should not mutate the original array", () => {
    const original = [...podcasts];
    sortPodcasts(podcasts, "alphabetical");

    expect(podcasts).toEqual(original);
  });
});

describe("filterPodcasts", () => {
  const podcasts = [
    createMockPodcast({ id: "1", title: "Tech Talk", author: "John Smith" }),
    createMockPodcast({
      id: "2",
      title: "Comedy Hour",
      author: "Jane Doe",
    }),
    createMockPodcast({
      id: "3",
      title: "Science Weekly",
      author: "Dr. Smith",
    }),
  ];

  it("should filter by title (case insensitive)", () => {
    const filtered = filterPodcasts(podcasts, "tech");

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("1");
  });

  it("should filter by author (case insensitive)", () => {
    const filtered = filterPodcasts(podcasts, "smith");

    expect(filtered).toHaveLength(2);
    expect(filtered.map((p) => p.id)).toContain("1");
    expect(filtered.map((p) => p.id)).toContain("3");
  });

  it("should return all podcasts for empty query", () => {
    expect(filterPodcasts(podcasts, "")).toHaveLength(3);
    expect(filterPodcasts(podcasts, "   ")).toHaveLength(3);
  });

  it("should return empty array when no matches found", () => {
    expect(filterPodcasts(podcasts, "nonexistent")).toHaveLength(0);
  });

  it("should handle partial matches", () => {
    const filtered = filterPodcasts(podcasts, "week");

    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe("Science Weekly");
  });
});

describe("preparePodcastsForDisplay", () => {
  const podcasts = [
    createMockPodcast({
      id: "1",
      title: "Zebra Podcast",
      subscribeDate: "2024-01-01T00:00:00Z",
    }),
    createMockPodcast({
      id: "2",
      title: "Alpha Podcast",
      subscribeDate: "2024-06-01T00:00:00Z",
    }),
  ];

  it("should filter, sort, and format podcasts", () => {
    const result = preparePodcastsForDisplay(podcasts, "", "alphabetical");

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Alpha Podcast");
    expect(result[1].title).toBe("Zebra Podcast");
    // Should be formatted (have displayTitle)
    expect(result[0].displayTitle).toBeDefined();
  });

  it("should apply filter before sorting", () => {
    const result = preparePodcastsForDisplay(podcasts, "zebra", "recent");

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Zebra Podcast");
  });

  it("should return empty array when filter matches nothing", () => {
    const result = preparePodcastsForDisplay(podcasts, "nonexistent", "recent");

    expect(result).toHaveLength(0);
  });
});
