import { DiscoveryPodcast } from '../../models';
import { FormattedDiscoveryPodcast } from './Discover.types';
import { formatEpisodeCount, isSubscribed, truncateText } from '../../utils';

export interface PodcastsByGenre {
  genre: string;
  podcasts: FormattedDiscoveryPodcast[];
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
    const genre = podcast.genre || 'Other';
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
