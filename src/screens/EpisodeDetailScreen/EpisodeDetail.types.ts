import {
  Episode,
  Podcast,
  DiscoveryPodcast,
  RichTextBlock,
} from '../../models';

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
  description: string; // Plain text, for previews and accessibility
  descriptionBlocks: RichTextBlock[]; // Same content as styled blocks with tappable links
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
