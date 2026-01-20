import { DiscoveryPodcast } from '../../models';

export interface SearchResultsViewProps {
  query: string;
  onPodcastPress: (podcast: DiscoveryPodcast) => void;
}

export interface FormattedSearchResult {
  id: string;
  title: string;
  displayTitle: string;
  author: string;
  feedUrl: string;
  artworkUrl: string;
  genre: string;
  episodeCount: number;
  episodeCountLabel: string;
}
