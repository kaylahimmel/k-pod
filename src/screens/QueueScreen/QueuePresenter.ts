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
    isCurrentlyPlaying,
  };
}

/**
 * Transforms an array of queue items into view-friendly format
 */
export function formatQueueItems(
  queue: QueueItem[],
  currentIndex: number,
): FormattedQueueItem[] {
  // Filter out any undefined/null items to handle race conditions
  return queue
    .filter((item) => item !== undefined && item !== null)
    .map((item, index) => formatQueueItem(item, index, currentIndex));
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
  const currentItem = queue[currentIndex];
  // Safety check for undefined/null items
  if (!currentItem) {
    return null;
  }
  return formatQueueItem(currentItem, currentIndex, currentIndex);
}

/**
 * Gets upcoming items (excluding currently playing) formatted for display
 */
export function getUpcomingItems(
  queue: QueueItem[],
  currentIndex: number,
): FormattedQueueItem[] {
  const upcomingQueue = queue.slice(currentIndex + 1);
  // Filter out any undefined/null items to handle race conditions
  return upcomingQueue
    .filter((item) => item !== undefined && item !== null)
    .map((item, index) =>
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
 * Returns count and time for all items from currentIndex onwards (including currently playing)
 */
export function getQueueStats(
  queue: QueueItem[],
  currentIndex: number,
): { count: string; remainingTime: string } {
  const totalCount = Math.max(0, queue.length - currentIndex);
  const remainingSeconds = calculateRemainingTime(queue, currentIndex);

  return {
    count: formatQueueCount(totalCount),
    remainingTime: formatRemainingTime(remainingSeconds),
  };
}

/**
 * Gets the unified display queue showing all items
 * Returns all items in the queue with the currently playing item highlighted
 */
export function getDisplayQueue(
  queue: QueueItem[],
  currentIndex: number,
): FormattedQueueItem[] {
  if (queue.length === 0) {
    return [];
  }

  // Filter out any undefined/null items to handle race conditions
  return queue
    .filter((item) => item !== undefined && item !== null)
    .map((item, index) => formatQueueItem(item, index, currentIndex));
}
