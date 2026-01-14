import { useCallback, useMemo } from "react";
import { useQueueStore } from "../../hooks/useQueueStore";
import { usePlayerStore } from "../../hooks/usePlayerStore";
import type { QueueItem } from "../../models";
import {
  formatQueueItems,
  getCurrentlyPlayingItem,
  getUpcomingItems,
  getQueueStats,
} from "./QueuePresenter";
import { FormattedQueueItem } from "./Queue.types";

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

  // Actions
  const handleRemoveFromQueue = useCallback(
    (itemId: string) => {
      removeFromQueue(itemId);
    },
    [removeFromQueue],
  );

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      // Adjust indices to account for the "currently playing" item being separate
      // The draggable list only contains upcoming items (currentIndex + 1 onwards)
      const actualFromIndex = currentIndex + 1 + fromIndex;
      const actualToIndex = currentIndex + 1 + toIndex;
      reorderQueue(actualFromIndex, actualToIndex);
    },
    [reorderQueue, currentIndex],
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
    currentlyPlaying,
    upcomingItems,
    queueStats,
    currentIndex,
    isPlaying,
    isEmpty,
    hasUpcoming,
    hasCurrentlyPlaying,
    handleRemoveFromQueue,
    handleReorder,
    handleClearQueue,
    handlePlayItem,
    handleEpisodePress,
    getOriginalQueueItem,
  };
};

export type QueueViewModel = ReturnType<typeof useQueueViewModel>;
