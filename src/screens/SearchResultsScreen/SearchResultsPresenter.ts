import { DiscoveryPodcast } from '../../models';
import { FormattedSearchResult } from './SearchResults.types';
import { formatEpisodeCount, isSubscribed, truncateText } from '../../utils';

/**
 * Transforms a DiscoveryPodcast into a view-friendly format for search results
 */
export function formatSearchResult(
  podcast: DiscoveryPodcast,
): FormattedSearchResult {
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
 * Transforms an array of podcasts into view-friendly search results format
 */
export function formatSearchResults(
  podcasts: DiscoveryPodcast[],
): FormattedSearchResult[] {
  return podcasts.map(formatSearchResult);
}

/**
 * Formats the results header text
 */
export function formatResultsHeader(query: string, count: number): string {
  if (count === 0) {
    return `No results for "${query}"`;
  } else if (count === 1) {
    return `1 result for "${query}"`;
  } else {
    return `${count} results for "${query}"`;
  }
}
