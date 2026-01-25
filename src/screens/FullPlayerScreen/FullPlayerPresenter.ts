import { PlaybackSpeed, QueueItem } from '../../models';
import {
  FormattedPlaybackTime,
  FormattedSpeed,
  FormattedUpNextItem,
} from './FullPlayer.types';

/**
 * Formats seconds to MM:SS or HH:MM:SS format
 */
export function formatTime(seconds: number): string {
  if (!seconds || seconds < 0) {
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
 * Formats remaining time with a minus sign prefix
 */
export function formatRemainingTime(
  currentSeconds: number,
  totalSeconds: number,
): string {
  const remaining = Math.max(0, totalSeconds - currentSeconds);
  return `-${formatTime(remaining)}`;
}

/**
 * Calculates progress as a value between 0 and 1
 */
export function calculateProgress(position: number, duration: number): number {
  if (!duration || duration <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, position / duration));
}

/**
 * Formats all playback time values for display
 */
export function formatPlaybackTime(
  position: number,
  duration: number,
): FormattedPlaybackTime {
  return {
    current: formatTime(position),
    remaining: formatRemainingTime(position, duration),
    total: formatTime(duration),
    progress: calculateProgress(position, duration),
  };
}

/**
 * Formats playback speed for display
 */
export function formatSpeedDisplay(speed: PlaybackSpeed): FormattedSpeed {
  const label = speed === 1 ? '1x' : `${speed}x`;
  return {
    label,
    value: speed,
  };
}

/**
 * Formats a queue item as the "up next" preview
 */
export function formatUpNextItem(
  queueItem: QueueItem | null,
): FormattedUpNextItem | null {
  if (!queueItem) {
    return null;
  }

  return {
    id: queueItem.id,
    episodeTitle: queueItem.episode.title,
    podcastTitle: queueItem.podcast.title,
    artworkUrl: queueItem.podcast.artworkUrl,
    formattedDuration: formatTime(queueItem.episode.duration),
  };
}

/**
 * Gets the next item in the queue after the current index
 */
export function getNextQueueItem(
  queue: QueueItem[],
  currentIndex: number,
): QueueItem | null {
  const nextIndex = currentIndex + 1;
  if (nextIndex < queue.length) {
    return queue[nextIndex];
  }
  return null;
}

/**
 * Formats the speed label for compact display (button)
 */
export function formatSpeedLabel(speed: PlaybackSpeed): string {
  return speed === 1 ? '1x' : `${speed}x`;
}

/**
 * Calculates seek position from a slider value (0-1 range to seconds)
 */
export function calculateSeekPosition(
  sliderValue: number,
  duration: number,
): number {
  return Math.floor(sliderValue * duration);
}
