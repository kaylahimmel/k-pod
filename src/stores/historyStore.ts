import { create } from 'zustand';
import { persist, PersistStorage, StorageValue } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryStore, ListeningHistory } from '../models';
import { STORAGE_KEYS } from '../constants';

/**
 * Shape written to storage. Only the history array is persisted.
 */
interface PersistedHistory {
  history: ListeningHistory[];
}

/**
 * Storage adapter that understands both the current zustand persist envelope
 * ({ state, version }) and the legacy bare ListeningHistory[] that
 * StorageService.saveHistory used to write to this same key.
 *
 * This cannot be done with persist's `migrate` option alone: zustand reads
 * `parsed.state` before calling migrate, and a legacy array has no `.state`,
 * so migrate would receive undefined and the existing history would be lost.
 * Normalizing during getItem is what keeps upgrading users' history intact.
 */
const historyStorage: PersistStorage<PersistedHistory> = {
  getItem: async (name) => {
    const raw = await AsyncStorage.getItem(name);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return { state: { history: parsed as ListeningHistory[] }, version: 0 };
    }

    return parsed as StorageValue<PersistedHistory>;
  },
  setItem: async (name, value) => {
    await AsyncStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: async (name) => {
    await AsyncStorage.removeItem(name);
  },
};

export const historyStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      history: [],
      hasHydrated: false,

      /**
       * Add an episode to listening history
       * If the episode already exists, update it in place
       *
       * Writing is handled by the persist middleware, so this stays
       * synchronous — there is no separate save call to keep in sync.
       */
      addToHistory: (episode, podcast, completionPercentage) => {
        const currentHistory = get().history;

        const existingIndex = currentHistory.findIndex(
          (item) => item.episode.id === episode.id,
        );

        const newHistoryItem: ListeningHistory = {
          podcast,
          episode,
          completedAt: new Date().toISOString(),
          completionPercentage,
        };

        if (existingIndex >= 0) {
          const updatedHistory = [...currentHistory];
          updatedHistory[existingIndex] = newHistoryItem;
          set({ history: updatedHistory });
          return;
        }

        set({ history: [newHistoryItem, ...currentHistory] });
      },

      /**
       * Clear all listening history
       */
      clearHistory: () => set({ history: [] }),

      /**
       * Set history directly (useful for testing)
       */
      setHistory: (history) => set({ history }),
    }),
    {
      name: STORAGE_KEYS.HISTORY,
      storage: historyStorage,
      version: 1,
      // getItem has already normalized the legacy bare array into the
      // persisted shape, so v0 -> v1 needs no field changes. The function
      // still has to exist: zustand discards any state whose version differs
      // from the configured one when no migrate is provided.
      migrate: (persistedState) => persistedState as PersistedHistory,
      partialize: (state) => ({ history: state.history }),
      // Screens read hasHydrated to show a loading state, so it must flip
      // even when hydration fails - otherwise the UI spins forever. The
      // callback runs after the store is assigned, so referencing
      // historyStore here is safe.
      onRehydrateStorage: () => () => {
        historyStore.setState({ hasHydrated: true });
      },
    },
  ),
);
