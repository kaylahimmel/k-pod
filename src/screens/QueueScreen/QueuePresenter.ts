import { QueueItem } from '../../models';
import { FormattedQueueItem } from './Queue.types';
import { truncateText } from '../../utils';

/**
 * Formats duration in seconds to HH:MM:SS or MM:SS format
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) {
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
 * Calculates total remaining time in queue from a given index
 */
export function calculateRemainingTime(
  queue: QueueItem[],
  fromIndex: number,
): number {
  return queue.slice(fromIndex).reduce((total, item) => {
    return total + (item.episode.duration || 0);
  }, 0);
}

/**
 * Formats remaining time as a human-readable string
 */
export function formatRemainingTime(seconds: number): string {
  if (!seconds || seconds <= 0) {
    return 'No time remaining';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}

/**
 * Formats queue position to a display label (1-indexed for users)
 */
export function formatPositionLabel(
  index: number,
  isCurrentlyPlaying: boolean,
): string {
  if (isCurrentlyPlaying) {
    return 'Now Playing';
  }
  return `#${index + 1}`;
}

/**
 * Transforms a QueueItem into a view-friendly format
 */
export function formatQueueItem(
  item: QueueItem,
  index: number,
  currentIndex: number,
): FormattedQueueItem {
  const isCurrentlyPlaying = index === currentIndex;

  return {
    id: item.id,
    episodeId: item.episode.id,
    episodeTitle: item.episode.title,
    displayTitle: truncateText(item.episode.title, 60),
    podcastTitle: item.podcast.title,
    podcastArtworkUrl: item.podcast.artworkUrl,
    duration: item.episode.duration,
    formattedDuration: formatDuration(item.episode.duration),
    position: index,
    positionLabel: formatPositionLabel(index, isCurrentlyPlaying),
  };
}

/**
 * Transforms an array of queue items into view-friendly format
 */
export function formatQueueItems(
  queue: QueueItem[],
  currentIndex: number,
): FormattedQueueItem[] {
  return queue.map((item, index) => formatQueueItem(item, index, currentIndex));
}

/**
 * Gets the currently playing item formatted for display
 */
export function getCurrentlyPlayingItem(
  queue: QueueItem[],
  currentIndex: number,
): FormattedQueueItem | null {
  if (queue.length === 0 || currentIndex >= queue.length) {
    return null;
  }
  return formatQueueItem(queue[currentIndex], currentIndex, currentIndex);
}

/**
 * Gets upcoming items (excluding currently playing) formatted for display
 */
export function getUpcomingItems(
  queue: QueueItem[],
  currentIndex: number,
): FormattedQueueItem[] {
  const upcomingQueue = queue.slice(currentIndex + 1);
  return upcomingQueue.map((item, index) =>
    formatQueueItem(item, currentIndex + 1 + index, currentIndex),
  );
}

/**
 * Formats queue count for display
 */
export function formatQueueCount(count: number): string {
  if (count === 0) {
    return 'Queue is empty';
  } else if (count === 1) {
    return '1 episode';
  } else {
    return `${count} episodes`;
  }
}

/**
 * Gets formatted queue statistics
 */
export function getQueueStats(
  queue: QueueItem[],
  currentIndex: number,
): { count: string; remainingTime: string } {
  const upcomingCount = Math.max(0, queue.length - currentIndex - 1);
  const remainingSeconds = calculateRemainingTime(queue, currentIndex + 1);

  return {
    count: formatQueueCount(upcomingCount),
    remainingTime: formatRemainingTime(remainingSeconds),
  };
}
