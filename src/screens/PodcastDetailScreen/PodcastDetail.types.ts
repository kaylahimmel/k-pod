import type { Episode, Podcast } from "../../models";

export interface PodcastDetailViewProps {
  podcastId: string;
  onEpisodePress: (episodeId: string) => void;
  onPlayEpisode: (episode: Episode, podcast: Podcast) => void;
  onUnsubscribe: () => void;
}

export interface FormattedEpisode {
  id: string;
  podcastId: string;
  title: string;
  displayTitle: string;
  description: string;
  truncatedDescription: string;
  audioUrl: string;
  duration: number;
  formattedDuration: string;
  publishDate: string;
  formattedPublishDate: string;
  played: boolean;
}

export interface FormattedPodcastDetail {
  id: string;
  title: string;
  author: string;
  artworkUrl: string;
  description: string;
  truncatedDescription: string;
  episodeCount: number;
  episodeCountLabel: string;
  formattedSubscribeDate: string;
  episodes: FormattedEpisode[];
}
