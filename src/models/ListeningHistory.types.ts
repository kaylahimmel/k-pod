import { Podcast } from './Podcast.types';
import { Episode } from './Episode.types';

export interface ListeningHistory {
  podcast: Podcast;
  episode: Episode;
  completedAt: string; // ISO 8601 timestamp; stored as a string because it
  // round-trips through JSON in AsyncStorage and rehydrates as a string
  completionPercentage: number; // Percentage of episode listened
}

export interface HistoryStore {
  history: ListeningHistory[];
  hasHydrated: boolean; // False until persist has read storage; drives loading UI
  addToHistory: (
    episode: Episode,
    podcast: Podcast,
    completionPercentage: number,
  ) => void;
  clearHistory: () => void;
  setHistory: (history: ListeningHistory[]) => void;
}
