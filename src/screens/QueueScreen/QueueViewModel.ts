import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useQueueStore, usePlaybackActions } from '../../hooks';
import { playerStore, queueStore } from '../../stores';
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
  const { queue, currentIndex, reorderQueue, setCurrentIndex } =
    useQueueStore();

  // These also stop the audio when the playing episode leaves the queue
  const { removeQueueItem, clearQueueAndStop, togglePlayPause } =
    usePlaybackActions();

  // Selects one value: subscribing to the whole store would re-render this
  // screen on every position update, which interrupts drag and drop
  const isPlaying = playerStore((state) => state.isPlaying);
  const playerEpisodeId = playerStore((state) => state.currentEpisode?.id);

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
      removeQueueItem(itemId);
    },
    [removeQueueItem],
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
          onPress: () => clearQueueAndStop(),
        },
      ],
    );
  }, [clearQueueAndStop]);

  // The player can hold a different episode from the card, or none, such as
  // after the queue is cleared or an episode ends with auto-play off
  const isCurrentItemLoaded =
    queue[currentIndex]?.episode.id === playerEpisodeId;
  const isCurrentItemPlaying = isCurrentItemLoaded && isPlaying;

  const handlePlayItem = useCallback(
    (item: FormattedQueueItem) => {
      // Find the actual queue item
      const queueItem = queue.find((q) => q.id === item.id);
      if (queueItem && onPlayItem) {
        // Call the play handler from usePlaybackActions
        onPlayItem(queueItem);
      }
    },
    [queue, onPlayItem],
  );

  // The button on the current card: pauses and resumes the player when it
  // holds this episode, and otherwise starts the episode the card shows
  const handlePlayCurrentItem = useCallback(
    (item: FormattedQueueItem) => {
      if (isCurrentItemLoaded) {
        togglePlayPause();
      } else {
        handlePlayItem(item);
      }
    },
    [isCurrentItemLoaded, togglePlayPause, handlePlayItem],
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
    isCurrentItemPlaying,
    isEmpty,
    hasUpcoming,
    hasCurrentlyPlaying,
    hasItems,
    handleRemoveFromQueue,
    handleReorder,
    handleClearQueue,
    handlePlayItem,
    handlePlayCurrentItem,
    handleEpisodePress,
    getOriginalQueueItem,
  };
};

export type QueueViewModel = ReturnType<typeof useQueueViewModel>;
