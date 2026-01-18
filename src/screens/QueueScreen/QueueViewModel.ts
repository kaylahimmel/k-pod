import { useCallback, useMemo } from 'react';
import { useQueueStore, usePlayerStore } from '../../hooks';
import { QueueItem } from '../../models';
import {
  formatQueueItems,
  getCurrentlyPlayingItem,
  getUpcomingItems,
  getQueueStats,
  getDisplayQueue,
} from './QueuePresenter';
import { FormattedQueueItem } from './Queue.types';

export const useQueueViewModel = (
  onEpisodePress?: (episodeId: string, podcastId: string) => void,
) => {
  const {
    queue,
    currentIndex,
    removeFromQueue,
    reorderQueue,
    clearQueue,
    setCurrentIndex,
  } = useQueueStore();

  const { isPlaying } = usePlayerStore();

  // Formatted data for the view
  const formattedQueue = useMemo(
    () => formatQueueItems(queue, currentIndex),
    [queue, currentIndex],
  );

  // Unified display queue (currently playing + upcoming)
  const displayQueue = useMemo(
    () => getDisplayQueue(queue, currentIndex),
    [queue, currentIndex],
  );

  const currentlyPlaying = useMemo(
    () => getCurrentlyPlayingItem(queue, currentIndex),
    [queue, currentIndex],
  );

  const upcomingItems = useMemo(
    () => getUpcomingItems(queue, currentIndex),
    [queue, currentIndex],
  );

  const queueStats = useMemo(
    () => getQueueStats(queue, currentIndex),
    [queue, currentIndex],
  );

  // State flags
  const isEmpty = queue.length === 0;
  const hasUpcoming = upcomingItems.length > 0;
  const hasCurrentlyPlaying = currentlyPlaying !== null;
  const hasItems = displayQueue.length > 0;

  // Actions
  const handleRemoveFromQueue = useCallback(
    (itemId: string) => {
      removeFromQueue(itemId);
    },
    [removeFromQueue],
  );

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      // The draggable list displays from currentIndex onwards (unified queue)
      // Adjust indices to map from display positions to actual queue positions
      const actualFromIndex = currentIndex + fromIndex;
      const actualToIndex = currentIndex + toIndex;
      reorderQueue(actualFromIndex, actualToIndex);

      // If we're moving the currently playing item, update currentIndex
      if (fromIndex === 0) {
        setCurrentIndex(actualToIndex);
      } else if (toIndex === 0) {
        setCurrentIndex(actualToIndex);
      } else if (fromIndex < toIndex && toIndex === 0) {
        setCurrentIndex(actualToIndex);
      } else if (fromIndex > toIndex && toIndex === 0) {
        setCurrentIndex(actualToIndex);
      }
    },
    [reorderQueue, currentIndex, setCurrentIndex],
  );

  const handleClearQueue = useCallback(() => {
    clearQueue();
  }, [clearQueue]);

  const handlePlayItem = useCallback(
    (item: FormattedQueueItem) => {
      // Find the actual index in the queue
      const actualIndex = queue.findIndex((q) => q.id === item.id);
      if (actualIndex !== -1) {
        setCurrentIndex(actualIndex);
      }
    },
    [queue, setCurrentIndex],
  );

  const handleEpisodePress = useCallback(
    (item: FormattedQueueItem) => {
      const queueItem = queue.find((q) => q.id === item.id);
      if (queueItem && onEpisodePress) {
        onEpisodePress(queueItem.episode.id, queueItem.podcast.id);
      }
    },
    [queue, onEpisodePress],
  );

  // Get original queue item by id (for drag operations)
  const getOriginalQueueItem = useCallback(
    (id: string): QueueItem | undefined => {
      return queue.find((item) => item.id === id);
    },
    [queue],
  );

  return {
    queue,
    formattedQueue,
    displayQueue,
    currentlyPlaying,
    upcomingItems,
    queueStats,
    currentIndex,
    isPlaying,
    isEmpty,
    hasUpcoming,
    hasCurrentlyPlaying,
    hasItems,
    handleRemoveFromQueue,
    handleReorder,
    handleClearQueue,
    handlePlayItem,
    handleEpisodePress,
    getOriginalQueueItem,
  };
};

export type QueueViewModel = ReturnType<typeof useQueueViewModel>;
