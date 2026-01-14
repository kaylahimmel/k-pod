import type { Podcast } from "../../models";
import { FormattedPodcast, SortOption } from "./Library.types";
import { truncateText } from "../../utils";

/**
 * Formats a date string to a relative time (e.g., "2 days ago")
 * or a formatted date if older than a week
 */
export function formatRelativeDate(isoDateString: string): string {
  const date = new Date(isoDateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
}

/**
 * Formats episode count to a display label
 */
export function formatEpisodeCount(count: number): string {
  if (count === 0) {
    return "No episodes";
  } else if (count === 1) {
    return "1 episode";
  } else {
    return `${count} episodes`;
  }
}

/**
 * Transforms a Podcast model into a view-friendly format
 */
export function formatPodcast(podcast: Podcast): FormattedPodcast {
  return {
    id: podcast.id,
    title: podcast.title,
    displayTitle: truncateText(podcast.title, 40),
    author: podcast.author,
    artworkUrl: podcast.artworkUrl,
    episodeCount: podcast.episodes.length,
    episodeCountLabel: formatEpisodeCount(podcast.episodes.length),
    subscribeDate: podcast.subscribeDate,
    formattedSubscribeDate: formatRelativeDate(podcast.subscribeDate),
  };
}

/**
 * Transforms an array of podcasts into view-friendly format
 */
export function formatPodcasts(podcasts: Podcast[]): FormattedPodcast[] {
  return podcasts.map(formatPodcast);
}

/**
 * Sorts podcasts based on the selected sort option
 */
export function sortPodcasts(
  podcasts: Podcast[],
  sortOption: SortOption,
): Podcast[] {
  const sorted = [...podcasts];

  switch (sortOption) {
    case "recent":
      // Most recently subscribed first
      return sorted.sort(
        (a, b) =>
          new Date(b.subscribeDate).getTime() -
          new Date(a.subscribeDate).getTime(),
      );
    case "alphabetical":
      // A-Z by title
      return sorted.sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase()),
      );
    case "episodeCount":
      // Most episodes first
      return sorted.sort((a, b) => b.episodes.length - a.episodes.length);
    default:
      return sorted;
  }
}

/**
 * Filters podcasts by search query
 * Searches in title and author fields
 */
export function filterPodcasts(podcasts: Podcast[], query: string): Podcast[] {
  if (!query.trim()) {
    return podcasts;
  }

  const lowerQuery = query.toLowerCase().trim();
  return podcasts.filter(
    (podcast) =>
      podcast.title.toLowerCase().includes(lowerQuery) ||
      podcast.author.toLowerCase().includes(lowerQuery),
  );
}

/**
 * Combines filtering and sorting, then formats for display
 */
export function preparePodcastsForDisplay(
  podcasts: Podcast[],
  searchQuery: string,
  sortOption: SortOption,
): FormattedPodcast[] {
  const filtered = filterPodcasts(podcasts, searchQuery);
  const sorted = sortPodcasts(filtered, sortOption);
  return formatPodcasts(sorted);
}
