import React, { useCallback } from "react";
import { Alert } from "react-native";
import type { DiscoverScreenProps } from "../../navigation/types";
import type { DiscoveryPodcast, Podcast } from "../../models";
import { podcastStore } from "../../stores";
import { DiscoverView } from "./DiscoverView";

// =============================================================================
// Helper Functions
// =============================================================================
/**
 * Converts a DiscoveryPodcast to a Podcast for subscription
 */
function createPodcastFromDiscovery(discovery: DiscoveryPodcast): Podcast {
  const now = new Date().toISOString();
  return {
    id: discovery.id,
    title: discovery.title,
    author: discovery.author,
    rssUrl: discovery.feedUrl,
    artworkUrl: discovery.artworkUrl,
    description: discovery.description || "",
    subscribeDate: now,
    lastUpdated: now,
    episodes: [], // Episodes will be fetched from RSS
  };
}

// =============================================================================
// Discover Screen - Navigation Wrapper
// =============================================================================
export const DiscoverScreen = ({ navigation }: DiscoverScreenProps) => {
  // Navigation handler: Navigate to podcast preview
  const handlePodcastPress = useCallback(
    (podcast: DiscoveryPodcast) => {
      navigation.navigate("PodcastPreview", { podcast });
    },
    [navigation],
  );

  // Action handler: Subscribe to podcast
  const handleSubscribe = useCallback((podcast: DiscoveryPodcast) => {
    const existingPodcasts = podcastStore.getState().podcasts;
    const alreadySubscribed = existingPodcasts.some(
      (p) => p.rssUrl.toLowerCase() === podcast.feedUrl.toLowerCase(),
    );

    if (alreadySubscribed) {
      Alert.alert(
        "Already Subscribed",
        `You're already subscribed to "${podcast.title}"`,
      );
      return;
    }

    const newPodcast = createPodcastFromDiscovery(podcast);
    podcastStore.getState().addPodcast(newPodcast);

    Alert.alert(
      "Subscribed!",
      `You're now subscribed to "${podcast.title}". Episodes will be loaded shortly.`,
    );
  }, []);

  return (
    <DiscoverView
      onPodcastPress={handlePodcastPress}
      onSubscribe={handleSubscribe}
    />
  );
};

export default DiscoverScreen;
