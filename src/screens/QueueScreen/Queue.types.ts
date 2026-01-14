export interface QueueViewProps {
  onEpisodePress?: (episodeId: string, podcastId: string) => void;
}

export interface FormattedQueueItem {
  id: string;
  episodeId: string;
  episodeTitle: string;
  displayTitle: string;
  podcastTitle: string;
  podcastArtworkUrl: string;
  duration: number;
  formattedDuration: string;
  position: number;
  positionLabel: string;
}
