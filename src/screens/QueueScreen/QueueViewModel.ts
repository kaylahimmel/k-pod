import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useQueueStore, usePlayerStore } from '../../hooks';
import { queueStore } from '../../stores';
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
  onEpisodePress?: (
    episodeId: string,
    podcastId: string,
    item: QueueItem,
  ) => void,
  onPlayItem?: (item: QueueItem) => void,
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

      // Get fresh currentIndex to avoid stale closure issues
      const { currentIndex: freshCurrentIndex } = queueStore.getState();

      // If we're moving the currently playing item, update currentIndex
      if (fromIndex === freshCurrentIndex) {
        setCurrentIndex(toIndex);
      } else if (toIndex === freshCurrentIndex) {
        // If we're moving an item to where the current item is,
        // the current item shifts by one position
        if (fromIndex < freshCurrentIndex) {
          setCurrentIndex(freshCurrentIndex - 1);
        } else {
          setCurrentIndex(freshCurrentIndex + 1);
        }
      } else if (
        fromIndex < freshCurrentIndex &&
        toIndex >= freshCurrentIndex
      ) {
        // Item moved from before current to after current
        setCurrentIndex(freshCurrentIndex - 1);
      } else if (
        fromIndex > freshCurrentIndex &&
        toIndex <= freshCurrentIndex
      ) {
        // Item moved from after current to before current
        setCurrentIndex(freshCurrentIndex + 1);
      }
    },
    [reorderQueue, setCurrentIndex],
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
      // Find the actual queue item
      const queueItem = queue.find((q) => q.id === item.id);
      if (queueItem && onPlayItem) {
        // Call the play handler from usePlaybackController
        onPlayItem(queueItem);
      }
    },
    [queue, onPlayItem],
  );

  const handleEpisodePress = useCallback(
    (item: FormattedQueueItem) => {
      const queueItem = queue.find((q) => q.id === item.id);
      if (queueItem && onEpisodePress) {
        onEpisodePress(queueItem.episode.id, queueItem.podcast.id, queueItem);
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
