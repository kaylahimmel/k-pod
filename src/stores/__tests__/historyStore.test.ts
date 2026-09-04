import { historyStore } from '../historyStore';
import { createMockEpisode, createMockPodcast } from '../../__mocks__';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants';

describe('historyStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    historyStore.setState({ history: [] });

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const state = historyStore.getState();
      expect(state.history).toEqual([]);
    });
  });

  describe('addToHistory', () => {
    it('should add a new episode to history', async () => {
      const podcast = createMockPodcast({ id: 'podcast-1' });
      const episode = createMockEpisode({ id: 'episode-1' });

      await historyStore.getState().addToHistory(episode, podcast, 100);

      const state = historyStore.getState();
      expect(state.history).toHaveLength(1);
      expect(state.history[0].podcast).toEqual(podcast);
      expect(state.history[0].episode).toEqual(episode);
      expect(state.history[0].completionPercentage).toBe(100);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.HISTORY,
        expect.stringContaining('episode-1'),
      );
    });

    it('should store completedAt as an ISO string, not a Date', async () => {
      // completedAt is typed string because it round-trips through JSON in
      // AsyncStorage: a Date written by the store rehydrates as a string, so
      // storing a Date made the type lie about what consumers actually get.
      const podcast = createMockPodcast({ id: 'podcast-1' });
      const episode = createMockEpisode({ id: 'episode-1' });

      historyStore.getState().addToHistory(episode, podcast, 100);

      const { completedAt } = historyStore.getState().history[0];
      expect(typeof completedAt).toBe('string');
      expect(completedAt).toBe(new Date(completedAt).toISOString());
    });

    it('should update existing episode in history', async () => {
      const podcast = createMockPodcast({ id: 'podcast-1' });
      const episode = createMockEpisode({ id: 'episode-1' });

      const initialDate = '2024-01-01T00:00:00.000Z';

      // Set initial history
      historyStore.setState({
        history: [
          {
            podcast,
            episode,
            completedAt: initialDate,
            completionPercentage: 50,
          },
        ],
      });

      await historyStore.getState().addToHistory(episode, podcast, 100);

      const state = historyStore.getState();
      expect(state.history).toHaveLength(1);
      expect(state.history[0].completionPercentage).toBe(100);
      expect(state.history[0].completedAt).not.toEqual(initialDate);
    });

    it('should add new episode at the beginning', async () => {
      const podcast1 = createMockPodcast({ id: 'podcast-1' });
      const episode1 = createMockEpisode({ id: 'episode-1' });
      const podcast2 = createMockPodcast({ id: 'podcast-2' });
      const episode2 = createMockEpisode({ id: 'episode-2' });

      // Set initial history
      historyStore.setState({
        history: [
          {
            podcast: podcast1,
            episode: episode1,
            completedAt: new Date().toISOString(),
            completionPercentage: 100,
          },
        ],
      });

      await historyStore.getState().addToHistory(episode2, podcast2, 95);

      const state = historyStore.getState();
      expect(state.history).toHaveLength(2);
      expect(state.history[0].episode.id).toBe('episode-2');
      expect(state.history[1].episode.id).toBe('episode-1');
    });
  });

  describe('clearHistory', () => {
    it('should clear all history', async () => {
      const podcast = createMockPodcast({ id: 'podcast-1' });
      const episode = createMockEpisode({ id: 'episode-1' });

      // Set initial history
      historyStore.setState({
        history: [
          {
            podcast,
            episode,
            completedAt: new Date().toISOString(),
            completionPercentage: 100,
          },
        ],
      });

      await historyStore.getState().clearHistory();

      const state = historyStore.getState();
      expect(state.history).toEqual([]);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.HISTORY,
        expect.stringContaining('"history":[]'),
      );
    });
  });

  describe('setHistory', () => {
    it('should set history directly', () => {
      const mockHistory = [
        {
          podcast: createMockPodcast({ id: 'podcast-1' }),
          episode: createMockEpisode({ id: 'episode-1' }),
          completedAt: new Date().toISOString(),
          completionPercentage: 100,
        },
      ];

      historyStore.getState().setHistory(mockHistory);

      expect(historyStore.getState().history).toEqual(mockHistory);
    });

    it('should replace existing history', () => {
      // Set initial history
      historyStore.setState({
        history: [
          {
            podcast: createMockPodcast({ id: 'old-podcast' }),
            episode: createMockEpisode({ id: 'old-episode' }),
            completedAt: new Date().toISOString(),
            completionPercentage: 100,
          },
        ],
      });

      const newHistory = [
        {
          podcast: createMockPodcast({ id: 'new-podcast' }),
          episode: createMockEpisode({ id: 'new-episode' }),
          completedAt: new Date().toISOString(),
          completionPercentage: 100,
        },
      ];

      historyStore.getState().setHistory(newHistory);

      expect(historyStore.getState().history).toEqual(newHistory);
    });
  });

  describe('persistence', () => {
    it('should persist under the history storage key', () => {
      expect(historyStore.persist.getOptions().name).toBe(STORAGE_KEYS.HISTORY);
    });

    it('should persist only the history array, not loading/error state', () => {
      const options = historyStore.persist.getOptions();
      const partialized = options.partialize?.(historyStore.getState());

      expect(partialized).toEqual({ history: historyStore.getState().history });
    });

    it('should report hydration status so screens can show a loading state', async () => {
      // Screens previously read isLoading from a manual loadHistory() call.
      // With persist owning hydration, they need an equivalent signal.
      historyStore.setState({ hasHydrated: false });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      await historyStore.persist.rehydrate();

      expect(historyStore.getState().hasHydrated).toBe(true);
    });

    it('should migrate a legacy raw history array written by StorageService', async () => {
      // Before this store used zustand persist, StorageService.saveHistory
      // wrote a bare ListeningHistory[] to the same key. Existing installs
      // still hold that shape, so rehydration must understand it.
      const legacyHistory = [
        {
          podcast: createMockPodcast({ id: 'legacy-podcast' }),
          episode: createMockEpisode({ id: 'legacy-episode' }),
          completedAt: new Date('2024-01-15T12:00:00Z').toISOString(),
          completionPercentage: 100,
        },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(legacyHistory),
      );

      await historyStore.persist.rehydrate();

      const state = historyStore.getState();
      expect(state.history).toHaveLength(1);
      expect(state.history[0].episode.id).toBe('legacy-episode');
    });

    it('should keep stored entries when an episode completes before any screen reads history', async () => {
      // Regression: history only hydrated when Profile/ListeningHistory
      // mounted, so handleEnd -> addToHistory read an empty in-memory array
      // and overwrote all stored history with a single entry.
      const legacyHistory = [
        {
          podcast: createMockPodcast({ id: 'existing-podcast' }),
          episode: createMockEpisode({ id: 'existing-episode' }),
          completedAt: new Date('2024-01-15T12:00:00Z').toISOString(),
          completionPercentage: 100,
        },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(legacyHistory),
      );

      await historyStore.persist.rehydrate();

      await historyStore
        .getState()
        .addToHistory(
          createMockEpisode({ id: 'new-episode' }),
          createMockPodcast({ id: 'new-podcast' }),
          95,
        );

      const ids = historyStore.getState().history.map((h) => h.episode.id);
      expect(ids).toContain('existing-episode');
      expect(ids).toContain('new-episode');
    });
  });
});
