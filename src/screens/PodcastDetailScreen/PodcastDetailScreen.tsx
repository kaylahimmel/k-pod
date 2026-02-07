import React, { useCallback } from 'react';
import { PodcastDetailScreenProps } from '../../navigation/types';
import { PodcastDetailView } from './PodcastDetailView';
import {
  usePodcastStore,
  useQueueStore,
  usePlaybackController,
} from '../../hooks';
import { Episode, Podcast } from '../../models';

export const PodcastDetailScreen = ({
  navigation,
  route,
}: PodcastDetailScreenProps) => {
  const { podcastId } = route.params;
  const { removePodcast } = usePodcastStore();
  const { queue, removeFromQueue } = useQueueStore();
  const { playEpisode, currentPodcast, stopCurrentAndPlayNext } =
    usePlaybackController();

  // Navigation handler: Navigate to episode detail
  const handleEpisodePressNav = useCallback(
    (episodeId: string) => {
      navigation.navigate('EpisodeDetail', { episodeId, podcastId });
    },
    [navigation, podcastId],
  );

  // Play episode without opening FullPlayer modal
  const handlePlayEpisodeNav = useCallback(
    (episode: Episode, podcast: Podcast) => {
      playEpisode(episode, podcast);
    },
    [playEpisode],
  );

  // Navigation handler: Remove podcast and go back
  const handleUnsubscribeNav = useCallback(async () => {
    // Check if the currently playing episode belongs to this podcast
    const isCurrentlyPlayingFromPodcast = currentPodcast?.id === podcastId;

    // Remove all queue items for this podcast first
    const itemsToRemove = queue.filter((item) => item.podcast.id === podcastId);
    itemsToRemove.forEach((item) => removeFromQueue(item.id));

    // If currently playing episode is from this podcast, stop and play next
    // (The next episode will be from the filtered queue, not this podcast)
    if (isCurrentlyPlayingFromPodcast) {
      await stopCurrentAndPlayNext();
    }

    // Remove the podcast
    removePodcast(podcastId);
    navigation.goBack();
  }, [
    removePodcast,
    podcastId,
    navigation,
    queue,
    removeFromQueue,
    currentPodcast,
    stopCurrentAndPlayNext,
  ]);

  return (
    <PodcastDetailView
      podcastId={podcastId}
      onEpisodePress={handleEpisodePressNav}
      onPlayEpisode={handlePlayEpisodeNav}
      onUnsubscribe={handleUnsubscribeNav}
    />
  );
};

export default PodcastDetailScreen;
