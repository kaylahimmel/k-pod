export interface LibraryViewProps {
  onPodcastPress: (podcastId: string) => void;
  onAddPodcastPress: () => void;
}

export interface FormattedPodcast {
  id: string;
  title: string;
  displayTitle: string; // Truncated for display
  author: string;
  artworkUrl: string;
  episodeCount: number;
  episodeCountLabel: string;
  subscribeDate: string;
  formattedSubscribeDate: string;
}

export type SortOption = 'recent' | 'alphabetical' | 'episodeCount';
