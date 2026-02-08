import { Podcast } from './Podcast.types';
import { Episode } from './Episode.types';

export interface ListeningHistory {
  podcast: Podcast;
  episode: Episode;
  completedAt: Date; // ISO string of completion date
  completionPercentage: number; // Percentage of episode listened
}

export interface HistoryStore {
  history: ListeningHistory[];
  isLoading: boolean;
  error: string | null;
  loadHistory: () => Promise<void>;
  addToHistory: (
    episode: Episode,
    podcast: Podcast,
    completionPercentage: number,
  ) => Promise<void>;
  clearHistory: () => Promise<void>;
  setHistory: (history: ListeningHistory[]) => void;
}
