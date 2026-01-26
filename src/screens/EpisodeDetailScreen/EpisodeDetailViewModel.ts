import { useCallback, useMemo } from 'react';
import { formatEpisodeDetail } from './EpisodeDetailPresenter';
import { Episode, Podcast, QueueItem } from '../../models';
import { usePodcastStore, useQueueStore, useToast } from '../../hooks';

/**
 * ViewModel for EpisodeDetailScreen
 * Manages state and logic for displaying episode details
 */
export const useEpisodeDetailViewModel = (
  episodeId: string,
  podcastId: string,
  onPlayEpisode: (episode: Episode, podcast: Podcast) => void,
  onGoBack: () => void,
) => {
  const { podcasts, loading } = usePodcastStore();
  const { addToQueue, queue } = useQueueStore();
  const toast = useToast();

  // Find the podcast and episode from the store
  const podcast = useMemo(
    () => podcasts.find((p) => p.id === podcastId),
    [podcasts, podcastId],
  );

  const episode = useMemo(
    () => podcast?.episodes.find((e) => e.id === episodeId),
    [podcast, episodeId],
  );

  // Format episode for display using presenter
  const formattedEpisode = useMemo(() => {
    if (!episode || !podcast) return null;
    return formatEpisodeDetail(episode, podcast);
  }, [episode, podcast]);

  // Check if episode is already in queue
  const isInQueue = useMemo(
    () => queue.some((item) => item.episode.id === episodeId),
    [queue, episodeId],
  );

  // Handler: Play episode
  const handlePlay = useCallback(() => {
    if (!episode || !podcast) return;
    onPlayEpisode(episode, podcast);
  }, [episode, podcast, onPlayEpisode]);

  // Handler: Add episode to queue
  const handleAddToQueue = useCallback(() => {
    if (!episode || !podcast) return;

    if (isInQueue) {
      toast.showToast('This episode is already in your queue');
      return;
    }

    const queueItem: QueueItem = {
      id: `${episode.id}-${Date.now()}`,
      episode,
      podcast,
      position: queue.length,
    };

    addToQueue(queueItem);
    toast.showToast(`"${episode.title}" added to queue`);
  }, [episode, podcast, isInQueue, queue.length, addToQueue, toast]);

  return {
    loading,
    podcast,
    episode,
    formattedEpisode,
    isInQueue,
    toast,
    handlePlay,
    handleAddToQueue,
    onGoBack,
  };
};
