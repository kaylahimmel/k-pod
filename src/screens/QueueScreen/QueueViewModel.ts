import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
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
      // Display queue now shows all items, so indices match directly
      reorderQueue(fromIndex, toIndex);

      // If we're moving the currently playing item, update currentIndex
      if (fromIndex === currentIndex) {
        setCurrentIndex(toIndex);
      } else if (toIndex === currentIndex) {
        // If we're moving an item to where the current item is,
        // the current item shifts by one position
        if (fromIndex < currentIndex) {
          setCurrentIndex(currentIndex - 1);
        } else {
          setCurrentIndex(currentIndex + 1);
        }
      } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
        // Item moved from before current to after current
        setCurrentIndex(currentIndex - 1);
      } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
        // Item moved from after current to before current
        setCurrentIndex(currentIndex + 1);
      }
    },
    [reorderQueue, currentIndex, setCurrentIndex],
  );

  const handleClearQueue = useCallback(() => {
    Alert.alert(
      'Clear Queue',
      'Are you sure you want to clear your entire queue? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearQueue(),
        },
      ],
    );
  }, [clearQueue]);

  const handlePlayItem = useCallback(
    (item: FormattedQueueItem) => {
      // Find the actual index in the queue
      const actualIndex = queue.findIndex((q) => q.id === item.id);
      if (actualIndex !== -1) {
        // If the item is not already at the top, move it there
        if (actualIndex !== 0) {
          reorderQueue(actualIndex, 0);
        }
        // Always set currentIndex to 0 since that's where the playing item will be
        setCurrentIndex(0);
      }
    },
    [queue, reorderQueue, setCurrentIndex],
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
