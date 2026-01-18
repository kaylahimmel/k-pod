import React, { useCallback } from "react";
import { DiscoverScreenProps } from "../../navigation/types";
import { DiscoveryPodcast } from "../../models";
import { DiscoverView } from "./DiscoverView";

export const DiscoverScreen = ({ navigation }: DiscoverScreenProps) => {
  // Navigation handler: Navigate to podcast preview
  const handlePodcastPressNav = useCallback(
    (podcast: DiscoveryPodcast) => {
      navigation.navigate("PodcastPreview", { podcast });
    },
    [navigation],
  );

  // Navigation handler: Navigate to podcast preview for subscription
  const handleSubscribeNav = useCallback(
    (podcast: DiscoveryPodcast) => {
      navigation.navigate("PodcastPreview", { podcast });
    },
    [navigation],
  );

  return (
    <DiscoverView
      onPodcastPress={handlePodcastPressNav}
      onSubscribe={handleSubscribeNav}
    />
  );
};

export default DiscoverScreen;
