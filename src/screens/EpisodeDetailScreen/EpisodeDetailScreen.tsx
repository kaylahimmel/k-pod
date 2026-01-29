import React, { useCallback } from 'react';
import { EpisodeDetailScreenProps } from '../../navigation/types';
import { EpisodeDetailView } from './EpisodeDetailView';
import { Episode, Podcast, DiscoveryPodcast } from '../../models';

// Extended route params type to handle both subscribed and discovery podcasts
interface ExtendedRouteParams {
  episodeId: string;
  podcastId: string;
  episode?: Episode;
  podcast?: DiscoveryPodcast;
}

export const EpisodeDetailScreen = ({
  navigation,
  route,
}: EpisodeDetailScreenProps) => {
  // Cast params to extended type to access optional discovery fields
  const params = route.params as ExtendedRouteParams;
  const { episodeId, podcastId, episode, podcast: discoveryPodcast } = params;

  // Navigation handler: Open full player with episode
  const handlePlayEpisodeNav = useCallback(
    (ep: Episode, pod: Podcast) => {
      navigation.navigate('FullPlayer', { episode: ep, podcast: pod });
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
      episode={episode}
      discoveryPodcast={discoveryPodcast}
    />
  );
};

export default EpisodeDetailScreen;
