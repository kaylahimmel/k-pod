import type { DiscoveryPodcast } from "../../models";
import type { FormattedDiscoveryPodcast } from "./Discover.types";

export interface PodcastsByGenre {
  genre: string;
  podcasts: FormattedDiscoveryPodcast[];
}

/**
 * Truncates text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text || "";
  }
  return text.slice(0, maxLength - 1).trim() + "…";
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
 * Transforms a DiscoveryPodcast into a view-friendly format
 */
export function formatDiscoveryPodcast(
  podcast: DiscoveryPodcast,
): FormattedDiscoveryPodcast {
  return {
    id: podcast.id,
    title: podcast.title,
    displayTitle: truncateText(podcast.title, 50),
    author: podcast.author,
    feedUrl: podcast.feedUrl,
    artworkUrl: podcast.artworkUrl,
    genre: podcast.genre,
    episodeCount: podcast.episodeCount,
    episodeCountLabel: formatEpisodeCount(podcast.episodeCount),
  };
}

/**
 * Transforms an array of podcasts into view-friendly format
 */
export function formatDiscoveryPodcasts(
  podcasts: DiscoveryPodcast[],
): FormattedDiscoveryPodcast[] {
  return podcasts.map(formatDiscoveryPodcast);
}

/**
 * Groups podcasts by genre
 */
export function groupPodcastsByGenre(
  podcasts: DiscoveryPodcast[],
): PodcastsByGenre[] {
  const genreMap = new Map<string, DiscoveryPodcast[]>();

  podcasts.forEach((podcast) => {
    const genre = podcast.genre || "Other";
    const existing = genreMap.get(genre) || [];
    genreMap.set(genre, [...existing, podcast]);
  });

  return Array.from(genreMap.entries())
    .map(([genre, podcastList]) => ({
      genre,
      podcasts: formatDiscoveryPodcasts(podcastList),
    }))
    .sort((a, b) => b.podcasts.length - a.podcasts.length);
}

/**
 * Gets unique genres from a list of podcasts
 */
export function getUniqueGenres(podcasts: DiscoveryPodcast[]): string[] {
  const genres = new Set<string>();
  podcasts.forEach((podcast) => {
    if (podcast.genre) {
      genres.add(podcast.genre);
    }
  });
  return Array.from(genres).sort();
}

/**
 * Filters podcasts by genre
 */
export function filterByGenre(
  podcasts: DiscoveryPodcast[],
  genre: string,
): DiscoveryPodcast[] {
  if (!genre || genre === "All") {
    return podcasts;
  }
  return podcasts.filter((p) => p.genre === genre);
}

/**
 * Filters out podcasts that are already subscribed
 */
export function filterOutSubscribed(
  discoveryPodcasts: DiscoveryPodcast[],
  subscribedFeedUrls: string[],
): DiscoveryPodcast[] {
  const subscribedSet = new Set(
    subscribedFeedUrls.map((url) => url.toLowerCase()),
  );
  return discoveryPodcasts.filter(
    (p) => !subscribedSet.has(p.feedUrl.toLowerCase()),
  );
}

/**
 * Checks if a podcast is already subscribed
 */
export function isSubscribed(
  feedUrl: string,
  subscribedFeedUrls: string[],
): boolean {
  const normalizedFeedUrl = feedUrl.toLowerCase();
  return subscribedFeedUrls.some(
    (url) => url.toLowerCase() === normalizedFeedUrl,
  );
}
