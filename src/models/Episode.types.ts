export interface Episode {
  id: string;
  podcastId: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number; // Duration in seconds
  publishDate: string; // ISO string representation of the date
  played: boolean; // Whether the episode has been played
}
