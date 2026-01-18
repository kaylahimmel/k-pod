import { Episode, Podcast } from '../../models';
import { FormattedEpisodeDetail } from './EpisodeDetail.types';
import { stripHtml } from '../../utils';
import {
  formatDuration,
  formatDurationLong,
  formatPublishDate,
} from '../PodcastDetailScreen/PodcastDetailPresenter';

/**
 * Transforms an Episode and its parent Podcast into a detailed view-friendly format
 */
export function formatEpisodeDetail(
  episode: Episode,
  podcast: Podcast,
): FormattedEpisodeDetail {
  const cleanDescription = stripHtml(episode.description);

  return {
    id: episode.id,
    podcastId: episode.podcastId,
    title: episode.title,
    description: cleanDescription,
    audioUrl: episode.audioUrl,
    duration: episode.duration,
    formattedDuration: formatDuration(episode.duration),
    formattedDurationLong: formatDurationLong(episode.duration),
    publishDate: episode.publishDate,
    formattedPublishDate: formatPublishDate(episode.publishDate),
    played: episode.played,
    podcastTitle: podcast.title,
    podcastAuthor: podcast.author,
    podcastArtworkUrl: podcast.artworkUrl,
  };
}
