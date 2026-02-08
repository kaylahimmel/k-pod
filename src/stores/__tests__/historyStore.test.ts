import { historyStore } from '../historyStore';
import { StorageService } from '../../services';
import { createMockEpisode, createMockPodcast } from '../../__mocks__';

// Mock StorageService
jest.mock('../../services/StorageService');

describe('historyStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    historyStore.setState({
      history: [],
      isLoading: false,
      error: null,
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const state = historyStore.getState();
      expect(state.history).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('loadHistory', () => {
    it('should load history from storage', async () => {
      const mockHistory = [
        {
          podcast: createMockPodcast({ id: 'podcast-1' }),
          episode: createMockEpisode({ id: 'episode-1' }),
          completedAt: new Date(),
          completionPercentage: 100,
        },
      ];

      (StorageService.loadHistory as jest.Mock).mockResolvedValue(mockHistory);

      await historyStore.getState().loadHistory();

      const state = historyStore.getState();
      expect(state.history).toEqual(mockHistory);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(StorageService.loadHistory).toHaveBeenCalledTimes(1);
    });

    it('should set loading state while loading', async () => {
      (StorageService.loadHistory as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100)),
      );

      const loadPromise = historyStore.getState().loadHistory();

      // Check loading state is true during load
      expect(historyStore.getState().isLoading).toBe(true);

      await loadPromise;

      // Check loading state is false after load
      expect(historyStore.getState().isLoading).toBe(false);
    });

    it('should handle errors when loading fails', async () => {
      const errorMessage = 'Storage error';
      (StorageService.loadHistory as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      await historyStore.getState().loadHistory();

      const state = historyStore.getState();
      expect(state.error).toContain(errorMessage);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('addToHistory', () => {
    it('should add a new episode to history', async () => {
      const podcast = createMockPodcast({ id: 'podcast-1' });
      const episode = createMockEpisode({ id: 'episode-1' });

      (StorageService.saveHistory as jest.Mock).mockResolvedValue(undefined);

      await historyStore.getState().addToHistory(episode, podcast, 100);

      const state = historyStore.getState();
      expect(state.history).toHaveLength(1);
      expect(state.history[0].podcast).toEqual(podcast);
      expect(state.history[0].episode).toEqual(episode);
      expect(state.history[0].completionPercentage).toBe(100);
      expect(StorageService.saveHistory).toHaveBeenCalledWith(state.history);
    });

    it('should update existing episode in history', async () => {
      const podcast = createMockPodcast({ id: 'podcast-1' });
      const episode = createMockEpisode({ id: 'episode-1' });

      const initialDate = new Date('2024-01-01T00:00:00.000Z');

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

      (StorageService.saveHistory as jest.Mock).mockResolvedValue(undefined);

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
            completedAt: new Date(),
            completionPercentage: 100,
          },
        ],
      });

      (StorageService.saveHistory as jest.Mock).mockResolvedValue(undefined);

      await historyStore.getState().addToHistory(episode2, podcast2, 95);

      const state = historyStore.getState();
      expect(state.history).toHaveLength(2);
      expect(state.history[0].episode.id).toBe('episode-2');
      expect(state.history[1].episode.id).toBe('episode-1');
    });

    it('should handle save errors', async () => {
      const podcast = createMockPodcast({ id: 'podcast-1' });
      const episode = createMockEpisode({ id: 'episode-1' });

      (StorageService.saveHistory as jest.Mock).mockRejectedValue(
        new Error('Save failed'),
      );

      await historyStore.getState().addToHistory(episode, podcast, 100);

      const state = historyStore.getState();
      expect(state.error).toContain('Save failed');
      // History should still be updated in store even if save fails
      expect(state.history).toHaveLength(1);
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
            completedAt: new Date(),
            completionPercentage: 100,
          },
        ],
      });

      (StorageService.saveHistory as jest.Mock).mockResolvedValue(undefined);

      await historyStore.getState().clearHistory();

      const state = historyStore.getState();
      expect(state.history).toEqual([]);
      expect(StorageService.saveHistory).toHaveBeenCalledWith([]);
    });

    it('should handle clear errors', async () => {
      (StorageService.saveHistory as jest.Mock).mockRejectedValue(
        new Error('Clear failed'),
      );

      await historyStore.getState().clearHistory();

      const state = historyStore.getState();
      expect(state.error).toContain('Clear failed');
    });
  });

  describe('setHistory', () => {
    it('should set history directly', () => {
      const mockHistory = [
        {
          podcast: createMockPodcast({ id: 'podcast-1' }),
          episode: createMockEpisode({ id: 'episode-1' }),
          completedAt: new Date(),
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
            completedAt: new Date(),
            completionPercentage: 100,
          },
        ],
      });

      const newHistory = [
        {
          podcast: createMockPodcast({ id: 'new-podcast' }),
          episode: createMockEpisode({ id: 'new-episode' }),
          completedAt: new Date(),
          completionPercentage: 100,
        },
      ];

      historyStore.getState().setHistory(newHistory);

      expect(historyStore.getState().history).toEqual(newHistory);
    });
  });
});
