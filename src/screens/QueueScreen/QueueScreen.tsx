import React, { useCallback } from "react";
import type { QueueScreenProps } from "../../navigation/types";
import { QueueView } from "./QueueView";

export const QueueScreen = ({ navigation }: QueueScreenProps) => {
  // Navigation handler: Navigate to episode detail
  const handleEpisodePress = useCallback(
    (episodeId: string, podcastId: string) => {
      navigation.navigate("EpisodeDetail", { episodeId, podcastId });
    },
    [navigation],
  );

  return <QueueView onEpisodePress={handleEpisodePress} />;
};

export default QueueScreen;
