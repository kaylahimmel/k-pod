import { Episode } from './Episode.types';

// Podcast (not episode) data model
export interface Podcast {
  id: string;
  title: string;
  author: string;
  rssUrl: string;
  artworkUrl: string;
  description: string;
  subscribeDate: string; // ISO date string
  lastUpdated: string; // ISO date string
  episodes: Episode[];
}

export interface PodcastStore {
  podcasts: Podcast[];
  loading: boolean;
  error: string | null;
  setPodcasts: (podcasts: Podcast[]) => void; // update entire podcast list on intial fetch or refresh)
  addPodcast: (podcast: Podcast) => void; // append single podcast to list when a new one is available
  removePodcast: (podcastId: string) => void; // Remove specific podcast library when user unsubscribes
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
