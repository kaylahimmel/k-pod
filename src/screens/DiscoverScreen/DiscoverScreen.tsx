import React, { useCallback } from "react";
import type { DiscoverScreenProps } from "../../navigation/types";
import type { DiscoveryPodcast } from "../../models";
import { DiscoverView } from "./DiscoverView";

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
