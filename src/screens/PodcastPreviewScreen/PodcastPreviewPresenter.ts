import { DiscoveryPodcast, Episode } from '../../models';
import {
  FormattedPodcastPreview,
  FormattedPreviewEpisode,
} from './PodcastPreview.types';
import { truncateText, stripHtml } from '../../utils';

/**
 * Formats duration in seconds to HH:MM:SS or MM:SS format
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0 || !isFinite(seconds)) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats a date to a relative time or formatted date
 */
export function formatPublishDate(isoDateString: string): string {
  const date = new Date(isoDateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

/**
 * Formats episode count to a display label
 */
export function formatEpisodeCount(count: number): string {
  if (count === 0) {
    return 'No episodes';
  } else if (count === 1) {
    return '1 episode';
  } else {
    return `${count} episodes`;
  }
}

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
