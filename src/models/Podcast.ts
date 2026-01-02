import { Episode } from './Episode';

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
