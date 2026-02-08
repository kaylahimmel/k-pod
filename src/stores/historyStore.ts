import { create } from 'zustand';
import { HistoryStore } from '../models';
import { StorageService } from '../services';

export const historyStore = create<HistoryStore>((set, get) => ({
  history: [],
  isLoading: false,
  error: null,

  /**
   * Load listening history from storage
   */
  loadHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const history = await StorageService.loadHistory();
      set({ history, isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load history';
      set({ error: message, isLoading: false });
    }
  },

  /**
   * Add an episode to listening history
   * If the episode already exists, update it
   */
  addToHistory: async (episode, podcast, completionPercentage) => {
    const currentHistory = get().history;

    // Check if this episode already exists in history
    const existingIndex = currentHistory.findIndex(
      (item) => item.episode.id === episode.id,
    );

    const newHistoryItem = {
      podcast,
      episode,
      completedAt: new Date(),
      completionPercentage,
    };

    let updatedHistory;
    if (existingIndex >= 0) {
      // Update existing entry
      updatedHistory = [...currentHistory];
      updatedHistory[existingIndex] = newHistoryItem;
    } else {
      // Add new entry at the beginning
      updatedHistory = [newHistoryItem, ...currentHistory];
    }

    set({ history: updatedHistory });

    // Persist to storage
    try {
      await StorageService.saveHistory(updatedHistory);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save history';
      set({ error: message });
    }
  },

  /**
   * Clear all listening history
   */
  clearHistory: async () => {
    set({ history: [], error: null });
    try {
      await StorageService.saveHistory([]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to clear history';
      set({ error: message });
    }
  },

  /**
   * Set history directly (useful for testing)
   */
  setHistory: (history) => set({ history }),
}));
