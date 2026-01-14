import type { Episode, Podcast } from "../../models";
import {
  FormattedEpisode,
  FormattedPodcastDetail,
} from "./PodcastDetail.types";
import { truncateText, stripHtml } from "../../utils";

/**
 * Formats duration in seconds to HH:MM:SS or MM:SS format
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0 || !isFinite(seconds)) {
    return "0:00";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Formats duration to a human-readable string (e.g., "1 hr 23 min")
 */
export function formatDurationLong(seconds: number): string {
  if (seconds <= 0 || !isFinite(seconds)) {
    return "0 min";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours} hr ${minutes} min`;
  } else if (hours > 0) {
    return `${hours} hr`;
  } else {
    return `${minutes} min`;
  }
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
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
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
