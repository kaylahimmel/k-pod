import React, { useCallback } from "react";
import { Alert } from "react-native";
import type { DiscoverScreenProps } from "../../navigation/types";
import type { DiscoveryPodcast, Podcast } from "../../models";
import { podcastStore } from "../../stores";
import { DiscoverView } from "./DiscoverView";
import { useDiscoverViewModel } from "./DiscoverViewModel";

export const DiscoverScreen = ({ navigation }: DiscoverScreenProps) => {
  // Navigation handler: Navigate to podcast preview
  const handlePodcastPress = useCallback(
    (podcast: DiscoveryPodcast) => {
      navigation.navigate("PodcastPreview", { podcast });
    },
    [navigation],
  );

  const handleSubscribe = useCallback(
    (podcast: DiscoveryPodcast) => {
      navigation.navigate("PodcastPreview", { podcast });
    },
    [navigation],
  );

  return (
    <DiscoverView
      onPodcastPress={handlePodcastPress}
      onSubscribe={handleSubscribe}
    />
  );
};

export default DiscoverScreen;
