import type { Episode, Podcast } from "../../models";

export interface PodcastDetailViewProps {
  podcastId: string;
  onEpisodePress: (episodeId: string) => void;
  onPlayEpisode: (episode: Episode, podcast: Podcast) => void;
  onUnsubscribe: () => void;
}
