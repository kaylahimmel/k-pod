import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { formatPodcastDetail } from './PodcastDetailPresenter';
import { Episode, Podcast, QueueItem } from '../../models';
import { usePodcastStore } from '../../hooks/usePodcastStore';
import { useQueueStore } from '../../hooks/useQueueStore';

// ViewModel: Manages state and logic
export const usePodcastDetailViewModel = (
  podcastId: string,
  onEpisodePress: (episodeId: string) => void,
  onPlayEpisode: (episode: Episode, podcast: Podcast) => void,
  onUnsubscribe: () => void,
) => {
  const [refreshing, setRefreshing] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { podcasts, loading } = usePodcastStore();
  const { addToQueue, queue } = useQueueStore();
  const podcast = podcasts.find((p) => p.id === podcastId);
  // Format podcast for display
  const formattedPodcast = podcast ? formatPodcastDetail(podcast) : null;

  const handleEpisodeRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: Add refresh logic when RSS service integration is complete
    setTimeout(() => setRefreshing(false), 1000);
  }, [setRefreshing]);

  const handleEpisodeUnsubscribe = useCallback(() => {
    Alert.alert(
      'Unsubscribe',
      `Are you sure you want to unsubscribe from "${podcast?.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unsubscribe',
          style: 'destructive',
          onPress: onUnsubscribe,
        },
      ],
    );
  }, [podcast?.title, onUnsubscribe]);

  const handleEpisodeAddToQueue = useCallback(
    (episode: Episode) => {
      if (!podcast) return;

      // Check if already in queue
      const isInQueue = queue.some((item) => item.episode.id === episode.id);
      if (isInQueue) {
        Alert.alert(
          'Already in Queue',
          'This episode is already in your queue',
        );
        return;
      }

      const queueItem: QueueItem = {
        id: `${episode.id}-${Date.now()}`,
        episode,
        podcast,
        position: queue.length,
      };

      addToQueue(queueItem);
      Alert.alert(
        'Added to Queue',
        `"${episode.title}" has been added to your queue`,
      );
    },
    [podcast, queue, addToQueue],
  );

  const handleEpisodePlayEpisode = useCallback(
    (episode: Episode) => {
      if (!podcast) return;
      onPlayEpisode(episode, podcast);
    },
    [podcast, onPlayEpisode],
  );

  const toggleEpisodeDescription = useCallback(() => {
    setShowFullDescription((prev) => !prev);
  }, []);

  // Get the raw episode for play/queue actions
  const getEpisodeRawData = useCallback(
    (episodeId: string): Episode | undefined => {
      return podcast?.episodes.find((e) => e.id === episodeId);
    },
    [podcast],
  );

  return {
    refreshing,
    showFullDescription,
    loading,
    podcast,
    formattedPodcast,
    handleEpisodeRefresh,
    handleEpisodeUnsubscribe,
    handleEpisodeAddToQueue,
    handleEpisodePlayEpisode,
    toggleEpisodeDescription,
    getEpisodeRawData,
    onEpisodePress,
  };
};
