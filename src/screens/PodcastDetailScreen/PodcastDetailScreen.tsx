import React, { useCallback } from "react";
import { PodcastDetailScreenProps } from "../../navigation/types";
import { PodcastDetailView } from "./PodcastDetailView";
import { usePodcastStore } from "../../hooks/usePodcastStore";
import { Episode, Podcast } from "../../models";

export const PodcastDetailScreen = ({
  navigation,
  route,
}: PodcastDetailScreenProps) => {
  const { podcastId } = route.params;
  const { removePodcast } = usePodcastStore();

  // Navigation handler: Navigate to episode detail
  const handleEpisodePressNav = useCallback(
    (episodeId: string) => {
      navigation.navigate("EpisodeDetail", { episodeId, podcastId });
    },
    [navigation, podcastId],
  );

  // Navigation handler: Open full player with episode
  const handlePlayEpisodeNav = useCallback(
    (episode: Episode, podcast: Podcast) => {
      navigation.navigate("FullPlayer", { episode, podcast });
    },
    [navigation],
  );

  // Navigation handler: Remove podcast and go back
  const handleUnsubscribeNav = useCallback(() => {
    removePodcast(podcastId);
    navigation.goBack();
  }, [removePodcast, podcastId, navigation]);

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
