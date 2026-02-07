import React, { useCallback } from 'react';
import { QueueScreenProps } from '../../navigation/types';
import { QueueView } from './QueueView';
import { usePlaybackController } from '../../hooks';
import { QueueItem } from '../../models';

export const QueueScreen = ({ navigation }: QueueScreenProps) => {
  const { playQueueItem } = usePlaybackController();

  // Navigation handler: Navigate to episode detail
  const handleEpisodePressNav = useCallback(
    (episodeId: string, podcastId: string) => {
      navigation.navigate('EpisodeDetail', { episodeId, podcastId });
    },
    [navigation],
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
