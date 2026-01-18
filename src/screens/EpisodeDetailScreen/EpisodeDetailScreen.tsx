import React, { useCallback } from 'react';
import { EpisodeDetailScreenProps } from '../../navigation/types';
import { EpisodeDetailView } from './EpisodeDetailView';
import { Episode, Podcast } from '../../models';

export const EpisodeDetailScreen = ({
  navigation,
  route,
}: EpisodeDetailScreenProps) => {
  const { episodeId, podcastId } = route.params;

  // Navigation handler: Open full player with episode
  const handlePlayEpisodeNav = useCallback(
    (episode: Episode, podcast: Podcast) => {
      navigation.navigate('FullPlayer', { episode, podcast });
    },
    [navigation],
  );

  // Navigation handler: Go back to previous screen
  const handleGoBackNav = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <EpisodeDetailView
      episodeId={episodeId}
      podcastId={podcastId}
      onPlayEpisode={handlePlayEpisodeNav}
      onGoBack={handleGoBackNav}
    />
  );
};

export default EpisodeDetailScreen;
