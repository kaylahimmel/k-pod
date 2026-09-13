import { Podcast } from '../../models';
import { FormattedPodcast, SortOption } from './Library.types';
import {
  formatEpisodeCount,
  formatRelativeDate,
  truncateText,
} from '../../utils';

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
    formattedSubscribeDate: formatRelativeDate(
      podcast.subscribeDate,
      'detailed',
    ),
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
    case 'recent':
      // Most recently subscribed first
      return sorted.sort(
        (a, b) =>
          new Date(b.subscribeDate).getTime() -
          new Date(a.subscribeDate).getTime(),
      );
    case 'alphabetical':
      // A-Z by title
      return sorted.sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase()),
      );
    case 'episodeCount':
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
