import { DiscoveryPodcast } from '../../models';

export interface PodcastPreviewViewProps {
  podcast: DiscoveryPodcast;
  onSubscribe: () => void;
}

export interface FormattedPreviewEpisode {
  id: string;
  title: string;
  displayTitle: string;
  description: string;
  truncatedDescription: string;
  duration: number;
  formattedDuration: string;
  publishDate: string;
  formattedPublishDate: string;
}

export interface FormattedPodcastPreview {
  id: string;
  title: string;
  displayTitle: string;
  author: string;
  feedUrl: string;
  artworkUrl: string;
  genre: string;
  description: string;
  truncatedDescription: string;
  episodeCount: number;
  episodeCountLabel: string;
}
