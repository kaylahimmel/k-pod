/**
 * Types for the Discovery Service
 * Based on iTunes Search API responses
 */

// Raw response from iTunes Search API
export interface ITunesSearchResponse {
  resultCount: number;
  results: ITunesPodcast[];
}

// Individual podcast result from iTunes
export interface ITunesPodcast {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  feedUrl: string;
  artworkUrl100: string;
  artworkUrl600: string;
  primaryGenreName: string;
  genres: string[];
  trackCount: number;
  releaseDate: string;
  country: string;
}

// Simplified podcast result for use in the app
export interface DiscoveryPodcast {
  id: string;
  title: string;
  author: string;
  feedUrl: string;
  artworkUrl: string;
  genre: string;
  episodeCount: number;
  description?: string;
}

// Search parameters
export interface SearchParams {
  query: string;
  limit?: number;
  country?: string;
}
