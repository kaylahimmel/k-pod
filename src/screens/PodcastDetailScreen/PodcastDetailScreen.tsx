import React, { useCallback } from 'react';
import { PodcastDetailScreenProps } from '../../navigation/types';
import { PodcastDetailView } from './PodcastDetailView';
import { usePodcastStore, useQueueStore } from '../../hooks';
import { Episode, Podcast } from '../../models';

export const PodcastDetailScreen = ({
  navigation,
  route,
}: PodcastDetailScreenProps) => {
  const { podcastId } = route.params;
  const { removePodcast } = usePodcastStore();
  const { queue, removeFromQueue } = useQueueStore();

  // Navigation handler: Navigate to episode detail
  const handleEpisodePressNav = useCallback(
    (episodeId: string) => {
      navigation.navigate('EpisodeDetail', { episodeId, podcastId });
    },
    [navigation, podcastId],
  );

  // Navigation handler: Open full player with episode
  const handlePlayEpisodeNav = useCallback(
    (episode: Episode, podcast: Podcast) => {
      navigation.navigate('FullPlayer', { episode, podcast });
    },
    [navigation],
  );

  // Navigation handler: Remove podcast and go back
  const handleUnsubscribeNav = useCallback(() => {
    // Remove all queue items for this podcast
    const itemsToRemove = queue.filter((item) => item.podcast.id === podcastId);
    itemsToRemove.forEach((item) => removeFromQueue(item.id));

    // Remove the podcast
    removePodcast(podcastId);
    navigation.goBack();
  }, [removePodcast, podcastId, navigation, queue, removeFromQueue]);

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
