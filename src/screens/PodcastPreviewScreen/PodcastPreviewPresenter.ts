import { DiscoveryPodcast, Episode } from '../../models';
import {
  FormattedPodcastPreview,
  FormattedPreviewEpisode,
} from './PodcastPreview.types';
import {
  formatDuration,
  formatEpisodeCount,
  formatPublishDate,
  isSubscribed,
  stripHtml,
  truncateText,
} from '../../utils';

/**
 * Transforms an Episode model into a preview-friendly format
 */
export function formatPreviewEpisode(
  episode: Episode,
): FormattedPreviewEpisode {
  const cleanDescription = stripHtml(episode.description);

  return {
    id: episode.id,
    title: episode.title,
    displayTitle: truncateText(episode.title, 80),
    description: cleanDescription,
    truncatedDescription: truncateText(cleanDescription, 120),
    duration: episode.duration,
    formattedDuration: formatDuration(episode.duration),
    publishDate: episode.publishDate,
    formattedPublishDate: formatPublishDate(episode.publishDate),
  };
}

/**
 * Transforms an array of episodes into preview-friendly format
 * Returns only the most recent episodes (for preview purposes)
 */
export function formatPreviewEpisodes(
  episodes: Episode[],
  limit: number = 5,
): FormattedPreviewEpisode[] {
  return [...episodes]
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
    )
    .slice(0, limit)
    .map(formatPreviewEpisode);
}

/**
 * Transforms a DiscoveryPodcast into a view-friendly preview format
 */
export function formatPodcastPreview(
  podcast: DiscoveryPodcast,
): FormattedPodcastPreview {
  const cleanDescription = podcast.description
    ? stripHtml(podcast.description)
    : '';

  return {
    id: podcast.id,
    title: podcast.title,
    displayTitle: truncateText(podcast.title, 60),
    author: podcast.author,
    feedUrl: podcast.feedUrl,
    artworkUrl: podcast.artworkUrl,
    genre: podcast.genre,
    description: cleanDescription,
    truncatedDescription: truncateText(cleanDescription, 200),
    episodeCount: podcast.episodeCount,
    episodeCountLabel: formatEpisodeCount(podcast.episodeCount),
  };
}
