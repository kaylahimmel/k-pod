import { Episode, Podcast } from '../../models';
import {
  FormattedEpisode,
  FormattedPodcastDetail,
} from './PodcastDetail.types';
import {
  formatDuration,
  formatEpisodeCount,
  formatPublishDate,
  stripHtml,
  truncateText,
} from '../../utils';

/**
 * Transforms an Episode model into a view-friendly format
 */
export function formatEpisode(episode: Episode): FormattedEpisode {
  const cleanDescription = stripHtml(episode.description);

  return {
    id: episode.id,
    podcastId: episode.podcastId,
    title: episode.title,
    displayTitle: truncateText(episode.title, 80),
    description: cleanDescription,
    truncatedDescription: truncateText(cleanDescription, 150),
    audioUrl: episode.audioUrl,
    duration: episode.duration,
    formattedDuration: formatDuration(episode.duration),
    publishDate: episode.publishDate,
    formattedPublishDate: formatPublishDate(episode.publishDate),
    played: episode.played,
  };
}

/**
 * Transforms an array of episodes into view-friendly format
 * Sorted by publish date (newest first)
 */
export function formatEpisodes(episodes: Episode[]): FormattedEpisode[] {
  return [...episodes]
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
    )
    .map(formatEpisode);
}

/**
 * Transforms a Podcast model into a detailed view-friendly format
 */
export function formatPodcastDetail(podcast: Podcast): FormattedPodcastDetail {
  const cleanDescription = stripHtml(podcast.description);

  return {
    id: podcast.id,
    title: podcast.title,
    author: podcast.author,
    artworkUrl: podcast.artworkUrl,
    description: cleanDescription,
    truncatedDescription: truncateText(cleanDescription, 200),
    episodeCount: podcast.episodes.length,
    episodeCountLabel: formatEpisodeCount(podcast.episodes.length),
    formattedSubscribeDate: formatPublishDate(podcast.subscribeDate),
    episodes: formatEpisodes(podcast.episodes),
  };
}
