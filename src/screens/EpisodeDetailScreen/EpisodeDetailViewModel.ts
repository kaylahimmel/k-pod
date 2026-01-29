import { useCallback, useMemo } from 'react';
import { formatEpisodeDetail } from './EpisodeDetailPresenter';
import { Episode, Podcast, QueueItem, DiscoveryPodcast } from '../../models';
import { usePodcastStore, useQueueStore, useToast } from '../../hooks';

/**
 * Creates a Podcast-like object from DiscoveryPodcast for use with player and queue
 * This allows playing episodes from unsubscribed podcasts
 */
const createPodcastFromDiscovery = (
  discoveryPodcast: DiscoveryPodcast,
  episode: Episode,
): Podcast => ({
  id: discoveryPodcast.id,
  title: discoveryPodcast.title,
  author: discoveryPodcast.author,
  rssUrl: discoveryPodcast.feedUrl,
  artworkUrl: discoveryPodcast.artworkUrl,
  description: discoveryPodcast.description || '',
  subscribeDate: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  episodes: [episode],
});

/**
 * ViewModel for EpisodeDetailScreen
 * Manages state and logic for displaying episode details
 * Supports both subscribed podcasts (store lookup) and unsubscribed podcasts (direct data)
 */
export const useEpisodeDetailViewModel = (
  episodeId: string,
  podcastId: string,
  onPlayEpisode: (episode: Episode, podcast: Podcast) => void,
  onGoBack: () => void,
  // Optional: Pass episode/podcast directly for unsubscribed podcasts
  propEpisode?: Episode,
  propDiscoveryPodcast?: DiscoveryPodcast,
) => {
  const { podcasts, loading } = usePodcastStore();
  const { addToQueue, queue } = useQueueStore();
  const toast = useToast();

  // Find the podcast and episode from the store (for subscribed podcasts)
  const storePodcast = useMemo(
    () => podcasts.find((p) => p.id === podcastId),
    [podcasts, podcastId],
  );

  const storeEpisode = useMemo(
    () => storePodcast?.episodes.find((e) => e.id === episodeId),
    [storePodcast, episodeId],
  );

  // Use prop data if provided, otherwise fall back to store lookup
  const episode = propEpisode || storeEpisode;

  // Create a podcast object from discovery data if needed
  const podcast = useMemo(() => {
    if (storePodcast) return storePodcast;
    if (propDiscoveryPodcast && propEpisode) {
      return createPodcastFromDiscovery(propDiscoveryPodcast, propEpisode);
    }
    return undefined;
  }, [storePodcast, propDiscoveryPodcast, propEpisode]);

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
