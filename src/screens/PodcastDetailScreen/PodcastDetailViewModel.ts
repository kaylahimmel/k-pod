import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { formatPodcastDetail } from './PodcastDetailPresenter';
import { Episode, Podcast, QueueItem } from '../../models';
import { usePodcastStore, useQueueStore, useToast } from '../../hooks';
import { RSSService } from '../../services/RSSService';

// ViewModel: Manages state and logic
export const usePodcastDetailViewModel = (
  podcastId: string,
  onEpisodePress: (episodeId: string) => void,
  onPlayEpisode: (episode: Episode, podcast: Podcast) => void,
  onUnsubscribe: () => void,
) => {
  const [refreshing, setRefreshing] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);
  const toast = useToast();
  const { podcasts, loading, updatePodcastEpisodes } = usePodcastStore();
  const { addToQueue, queue } = useQueueStore();
  const podcast = podcasts.find((p) => p.id === podcastId);
  // Format podcast for display
  const formattedPodcast = podcast ? formatPodcastDetail(podcast) : null;

  // Refreshes episodes for this podcast by fetching latest from RSS feed
  const handleEpisodeRefresh = useCallback(async () => {
    if (!podcast) return;

    setRefreshing(true);

    const result = await RSSService.refreshEpisodes(podcast.id, podcast.rssUrl);

    if (result.success && result.data) {
      const existingIds = new Set(podcast.episodes.map((ep) => ep.id));
      const newEpisodes = result.data.filter((ep) => !existingIds.has(ep.id));
      updatePodcastEpisodes(podcast.id, result.data);

      if (newEpisodes.length > 0) {
        toast.showToast(
          `Found ${newEpisodes.length} new episode${newEpisodes.length === 1 ? '' : 's'}`,
        );
      } else {
        toast.showToast('No new episodes');
      }
    } else {
      toast.showToast('Failed to refresh episodes');
    }

    setRefreshing(false);
  }, [podcast, updatePodcastEpisodes, toast]);

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

      // Check if already in queue - if so, do nothing (button should be disabled)
      const isInQueue = queue.some((item) => item.episode.id === episode.id);
      if (isInQueue) {
        return;
      }

      const queueItem: QueueItem = {
        id: `${episode.id}-${Date.now()}`,
        episode,
        podcast,
        position: queue.length,
      };

      addToQueue(queueItem);

      // Show toast notification
      toast.showToast(`"${episode.title}" added to queue`);
    },
    [podcast, queue, addToQueue, toast],
  );

  const isEpisodeInQueue = useCallback(
    (episodeId: string): boolean => {
      return queue.some((item) => item.episode.id === episodeId);
    },
    [queue],
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

  const toggleShowAllEpisodes = useCallback(() => {
    setShowAllEpisodes((prev) => !prev);
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
    showAllEpisodes,
    toast,
    loading,
    podcast,
    formattedPodcast,
    handleEpisodeRefresh,
    handleEpisodeUnsubscribe,
    handleEpisodeAddToQueue,
    handleEpisodePlayEpisode,
    toggleEpisodeDescription,
    toggleShowAllEpisodes,
    getEpisodeRawData,
    isEpisodeInQueue,
    onEpisodePress,
  };
};
