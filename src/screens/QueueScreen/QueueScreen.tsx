import React, { useCallback } from 'react';
import { QueueScreenProps } from '../../navigation/types';
import { QueueView } from './QueueView';
import { usePlaybackController, usePlayerStore } from '../../hooks';
import { QueueItem } from '../../models';

export const QueueScreen = ({ navigation }: QueueScreenProps) => {
  const { playQueueItem } = usePlaybackController();
  const { currentEpisode } = usePlayerStore();

  // Navigation handler: Navigate to episode detail or full player
  const handleEpisodePressNav = useCallback(
    (episodeId: string, podcastId: string, episode: QueueItem) => {
      // If tapping the currently playing episode, open FullPlayer modal
      if (currentEpisode && currentEpisode.id === episodeId) {
        navigation.navigate('FullPlayer', {
          episode: episode.episode,
          podcast: episode.podcast,
        });
      } else {
        // Otherwise, navigate to EpisodeDetail screen
        navigation.navigate('EpisodeDetail', { episodeId, podcastId });
      }
    },
    [navigation, currentEpisode],
  );

  // Play queue item handler
  const handlePlayItemNav = useCallback(
    async (item: QueueItem) => {
      await playQueueItem(item);
    },
    [playQueueItem],
  );

  return (
    <QueueView
      onEpisodePress={handleEpisodePressNav}
      onPlayItem={handlePlayItemNav}
    />
  );
};

export default QueueScreen;
