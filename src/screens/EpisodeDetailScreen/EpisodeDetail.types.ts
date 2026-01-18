import { Episode, Podcast } from '../../models';

export interface EpisodeDetailViewProps {
  episodeId: string;
  podcastId: string;
  onPlayEpisode: (episode: Episode, podcast: Podcast) => void;
  onGoBack: () => void;
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
