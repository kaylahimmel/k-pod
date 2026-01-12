import { createMockDiscoveryPodcast } from "../../../__mocks__";
import {
  truncateText,
  formatEpisodeCount,
  formatDiscoveryPodcast,
  formatDiscoveryPodcasts,
  groupPodcastsByGenre,
  getUniqueGenres,
  filterByGenre,
  filterOutSubscribed,
  isSubscribed,
} from "../DiscoverPresenter";

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
// formatDiscoveryPodcast Tests
// =============================================================================

describe("formatDiscoveryPodcast", () => {
  it("should format podcast with all fields", () => {
    const podcast = createMockDiscoveryPodcast({
      title: "My Podcast",
      author: "John Doe",
      episodeCount: 50,
    });

    const formatted = formatDiscoveryPodcast(podcast);

    expect(formatted.id).toBe(podcast.id);
    expect(formatted.title).toBe(podcast.title);
    expect(formatted.displayTitle).toBe("My Podcast");
    expect(formatted.author).toBe("John Doe");
    expect(formatted.episodeCount).toBe(50);
    expect(formatted.episodeCountLabel).toBe("50 episodes");
  });

  it("should truncate long titles", () => {
    const podcast = createMockDiscoveryPodcast({
      title: "A".repeat(60),
    });

    const formatted = formatDiscoveryPodcast(podcast);

    expect(formatted.displayTitle.length).toBeLessThanOrEqual(50);
    expect(formatted.displayTitle.endsWith("…")).toBe(true);
  });
});

// =============================================================================
// formatDiscoveryPodcasts Tests
// =============================================================================

describe("formatDiscoveryPodcasts", () => {
  it("should format array of podcasts", () => {
    const podcasts = [
      createMockDiscoveryPodcast({ id: "1" }),
      createMockDiscoveryPodcast({ id: "2" }),
    ];

    const formatted = formatDiscoveryPodcasts(podcasts);

    expect(formatted).toHaveLength(2);
    expect(formatted[0].id).toBe("1");
    expect(formatted[1].id).toBe("2");
  });

  it("should return empty array for empty input", () => {
    expect(formatDiscoveryPodcasts([])).toEqual([]);
  });
});

// =============================================================================
// groupPodcastsByGenre Tests
// =============================================================================

describe("groupPodcastsByGenre", () => {
  it("should group podcasts by genre", () => {
    const podcasts = [
      createMockDiscoveryPodcast({ id: "1", genre: "Technology" }),
      createMockDiscoveryPodcast({ id: "2", genre: "Comedy" }),
      createMockDiscoveryPodcast({ id: "3", genre: "Technology" }),
    ];

    const grouped = groupPodcastsByGenre(podcasts);

    expect(grouped).toHaveLength(2);
    // Technology should be first (2 podcasts) due to sorting by count
    expect(grouped[0].genre).toBe("Technology");
    expect(grouped[0].podcasts).toHaveLength(2);
    expect(grouped[1].genre).toBe("Comedy");
    expect(grouped[1].podcasts).toHaveLength(1);
  });

  it("should use 'Other' for podcasts without genre", () => {
    const podcasts = [
      createMockDiscoveryPodcast({ id: "1", genre: "" }),
      createMockDiscoveryPodcast({ id: "2", genre: "Comedy" }),
    ];

    const grouped = groupPodcastsByGenre(podcasts);

    const otherGroup = grouped.find((g) => g.genre === "Other");
    expect(otherGroup).toBeDefined();
    expect(otherGroup?.podcasts).toHaveLength(1);
  });

  it("should return empty array for empty input", () => {
    expect(groupPodcastsByGenre([])).toEqual([]);
  });
});

// =============================================================================
// getUniqueGenres Tests
// =============================================================================

describe("getUniqueGenres", () => {
  it("should return unique genres sorted alphabetically", () => {
    const podcasts = [
      createMockDiscoveryPodcast({ genre: "Technology" }),
      createMockDiscoveryPodcast({ genre: "Comedy" }),
      createMockDiscoveryPodcast({ genre: "Technology" }),
      createMockDiscoveryPodcast({ genre: "Arts" }),
    ];

    const genres = getUniqueGenres(podcasts);

    expect(genres).toEqual(["Arts", "Comedy", "Technology"]);
  });

  it("should exclude empty genres", () => {
    const podcasts = [
      createMockDiscoveryPodcast({ genre: "Technology" }),
      createMockDiscoveryPodcast({ genre: "" }),
    ];

    const genres = getUniqueGenres(podcasts);

    expect(genres).toEqual(["Technology"]);
  });

  it("should return empty array for empty input", () => {
    expect(getUniqueGenres([])).toEqual([]);
  });
});

// =============================================================================
// filterByGenre Tests
// =============================================================================

describe("filterByGenre", () => {
  const podcasts = [
    createMockDiscoveryPodcast({ id: "1", genre: "Technology" }),
    createMockDiscoveryPodcast({ id: "2", genre: "Comedy" }),
    createMockDiscoveryPodcast({ id: "3", genre: "Technology" }),
  ];

  it("should filter podcasts by genre", () => {
    const filtered = filterByGenre(podcasts, "Technology");

    expect(filtered).toHaveLength(2);
    expect(filtered.every((p) => p.genre === "Technology")).toBe(true);
  });

  it("should return all podcasts for 'All' genre", () => {
    const filtered = filterByGenre(podcasts, "All");

    expect(filtered).toHaveLength(3);
  });

  it("should return all podcasts for empty genre", () => {
    const filtered = filterByGenre(podcasts, "");

    expect(filtered).toHaveLength(3);
  });
});

// =============================================================================
// filterOutSubscribed Tests
// =============================================================================

describe("filterOutSubscribed", () => {
  it("should filter out subscribed podcasts by feed URL", () => {
    const podcasts = [
      createMockDiscoveryPodcast({ id: "1", feedUrl: "https://feed1.com" }),
      createMockDiscoveryPodcast({ id: "2", feedUrl: "https://feed2.com" }),
      createMockDiscoveryPodcast({ id: "3", feedUrl: "https://feed3.com" }),
    ];

    const subscribedUrls = ["https://feed1.com", "https://feed3.com"];
    const filtered = filterOutSubscribed(podcasts, subscribedUrls);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("2");
  });

  it("should be case-insensitive when comparing URLs", () => {
    const podcasts = [
      createMockDiscoveryPodcast({ feedUrl: "https://FEED.com" }),
    ];

    const subscribedUrls = ["https://feed.com"];
    const filtered = filterOutSubscribed(podcasts, subscribedUrls);

    expect(filtered).toHaveLength(0);
  });

  it("should return all podcasts when none are subscribed", () => {
    const podcasts = [
      createMockDiscoveryPodcast({ id: "1" }),
      createMockDiscoveryPodcast({ id: "2" }),
    ];

    const filtered = filterOutSubscribed(podcasts, []);

    expect(filtered).toHaveLength(2);
  });
});

// =============================================================================
// isSubscribed Tests
// =============================================================================

describe("isSubscribed", () => {
  it("should return true if feed URL is in subscribed list", () => {
    const subscribedUrls = ["https://feed1.com", "https://feed2.com"];

    expect(isSubscribed("https://feed1.com", subscribedUrls)).toBe(true);
  });

  it("should return false if feed URL is not in subscribed list", () => {
    const subscribedUrls = ["https://feed1.com"];

    expect(isSubscribed("https://other.com", subscribedUrls)).toBe(false);
  });

  it("should be case-insensitive", () => {
    const subscribedUrls = ["https://feed.com"];

    expect(isSubscribed("https://FEED.COM", subscribedUrls)).toBe(true);
  });

  it("should return false for empty subscribed list", () => {
    expect(isSubscribed("https://feed.com", [])).toBe(false);
  });
});
