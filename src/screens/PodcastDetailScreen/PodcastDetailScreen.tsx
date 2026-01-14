import React, { useCallback } from "react";
import type { PodcastDetailScreenProps } from "../../navigation/types";
import { PodcastDetailView } from "./PodcastDetailView";
import { usePodcastStore } from "../../hooks/usePodcastStore";
import type { Episode, Podcast } from "../../models";

export const PodcastDetailScreen = ({
  navigation,
  route,
}: PodcastDetailScreenProps) => {
  const { podcastId } = route.params;
  const { removePodcast } = usePodcastStore();

  // Navigation handler: Navigate to episode detail
  const handleEpisodePress = useCallback(
    (episodeId: string) => {
      navigation.navigate("EpisodeDetail", { episodeId, podcastId });
    },
    [navigation, podcastId],
  );

  // Play handler: Open full player with episode
  const handlePlayEpisode = useCallback(
    (episode: Episode, podcast: Podcast) => {
      navigation.navigate("FullPlayer", { episode, podcast });
    },
    [navigation],
  );

  // Unsubscribe handler: Remove podcast and go back
  const handleUnsubscribe = useCallback(() => {
    removePodcast(podcastId);
    navigation.goBack();
  }, [removePodcast, podcastId, navigation]);

  return (
    <PodcastDetailView
      podcastId={podcastId}
      onEpisodePress={handleEpisodePress}
      onPlayEpisode={handlePlayEpisode}
      onUnsubscribe={handleUnsubscribe}
    />
  );
};

export default PodcastDetailScreen;
