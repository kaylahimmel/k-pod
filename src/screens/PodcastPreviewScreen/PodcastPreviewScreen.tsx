import React, { useCallback } from 'react';
import { PodcastPreviewScreenProps } from '../../navigation/types';
import { PodcastPreviewView } from './PodcastPreviewView';
import { Episode, Podcast } from '../../models';
import { usePlaybackController } from '../../hooks';

export const PodcastPreviewScreen = ({
  navigation,
  route,
}: PodcastPreviewScreenProps) => {
  const { podcast } = route.params;
  const { playEpisode } = usePlaybackController();

  // Navigate back after successful subscription
  const handleSubscribe = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Navigate to episode detail
  const handleEpisodePressNav = useCallback(
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

  // Play episode without opening FullPlayer modal
  const handlePlayEpisodeNav = useCallback(
    (episode: Episode, podcastData: Podcast) => {
      playEpisode(episode, podcastData);
    },
    [playEpisode],
  );

  return (
    <PodcastPreviewView
      podcast={podcast}
      onSubscribe={handleSubscribe}
      onEpisodePress={handleEpisodePressNav}
      onPlayEpisode={handlePlayEpisodeNav}
    />
  );
};

export default PodcastPreviewScreen;
