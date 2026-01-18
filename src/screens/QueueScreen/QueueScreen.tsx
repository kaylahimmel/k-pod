import React, { useCallback } from 'react';
import { QueueScreenProps } from '../../navigation/types';
import { QueueView } from './QueueView';

export const QueueScreen = ({ navigation }: QueueScreenProps) => {
  // Navigation handler: Navigate to episode detail
  const handleEpisodePressNav = useCallback(
    (episodeId: string, podcastId: string) => {
      navigation.navigate('EpisodeDetail', { episodeId, podcastId });
    },
    [navigation],
  );

  return <QueueView onEpisodePress={handleEpisodePressNav} />;
};

export default QueueScreen;
