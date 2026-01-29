import React, { useCallback } from 'react';
import { PodcastPreviewScreenProps } from '../../navigation/types';
import { PodcastPreviewView } from './PodcastPreviewView';
import { Episode } from '../../models';

export const PodcastPreviewScreen = ({
  navigation,
  route,
}: PodcastPreviewScreenProps) => {
  const { podcast } = route.params;

  // Navigate back after successful subscription
  const handleSubscribe = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Navigate to episode detail
  const handleEpisodePress = useCallback(
    (episode: Episode) => {
      navigation.navigate('EpisodeDetail', {
        episodeId: episode.id,
        podcastId: podcast.id,
        episode,
        podcast,
      });
    },
    [navigation, podcast],
  );

  return (
    <PodcastPreviewView
      podcast={podcast}
      onSubscribe={handleSubscribe}
      onEpisodePress={handleEpisodePress}
    />
  );
};

export default PodcastPreviewScreen;
