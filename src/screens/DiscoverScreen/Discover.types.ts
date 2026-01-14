export interface FormattedDiscoveryPodcast {
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

export interface PodcastsByGenre {
  genre: string;
  podcasts: FormattedDiscoveryPodcast[];
}
