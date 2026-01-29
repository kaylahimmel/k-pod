import { Episode, Podcast, DiscoveryPodcast } from '../../models';

export interface EpisodeDetailViewProps {
  episodeId: string;
  podcastId: string;
  onPlayEpisode: (episode: Episode, podcast: Podcast) => void;
  onGoBack: () => void;
  // Optional: Pass episode/podcast directly for unsubscribed podcasts
  episode?: Episode;
  discoveryPodcast?: DiscoveryPodcast;
}

export interface FormattedEpisodeDetail {
  id: string;
  podcastId: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  formattedDuration: string;
  formattedDurationLong: string;
  publishDate: string;
  formattedPublishDate: string;
  played: boolean;
  podcastTitle: string;
  podcastAuthor: string;
  podcastArtworkUrl: string;
}
