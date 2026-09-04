import { StorageService } from '../StorageService';
import { createMockListeningHistory } from '../../__mocks__';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===========================================
// MOCK SETUP
// ===========================================
// We need to simulate AsyncStorage since Jest doesn't have real device storage.
// This in-memory object acts as our fake storage.
let mockStore: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn((key: string, value: string) => {
    mockStore[key] = value;
    return Promise.resolve();
  }),
  getItem: jest.fn((key: string) => {
    if (key in mockStore) {
      return Promise.resolve(mockStore[key]);
    } else {
      return Promise.resolve(null);
    }
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStore[key];
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() => {
    return Promise.resolve(Object.keys(mockStore));
  }),
  multiRemove: jest.fn((keys: string[]) => {
    keys.forEach((key) => delete mockStore[key]);
    return Promise.resolve();
  }),
}));

// ===========================================
// TESTS
// ===========================================

describe('StorageService', () => {
  beforeEach(() => {
    // Clear the mock store before each test so tests don't affect each other
    mockStore = {};
    jest.clearAllMocks();
  });

  describe('base methods', () => {
    it('should save and load data', async () => {
      const testData = { name: 'test', value: 123 };

      await StorageService.saveData('test-key', testData);
      const loaded = await StorageService.loadData('test-key');

      expect(loaded).toEqual(testData);
    });

    it('should return null for non-existent key', async () => {
      const loaded = await StorageService.loadData('non-existent');
      expect(loaded).toBeNull();
    });

    it('should remove data', async () => {
      await StorageService.saveData('to-remove', { data: 'test' });
      await StorageService.removeData('to-remove');

      const loaded = await StorageService.loadData('to-remove');
      expect(loaded).toBeNull();
    });
  });

  describe('podcasts storage', () => {
    it('should save and load podcasts', async () => {
      const podcasts = [
        {
          id: '1',
          title: 'Test Podcast',
          author: 'Test Author',
          rssUrl: 'https://example.com/rss',
          artworkUrl: 'https://example.com/art.jpg',
          description: 'A test podcast',
          subscribeDate: '2024-01-01',
          lastUpdated: '2024-01-01',
          episodes: [],
        },
      ];

      // Queue/podcast/settings persistence is owned by zustand persist;
      // generic saveData/loadData remain for ad-hoc keys
      await StorageService.saveData('test-podcasts', podcasts);
      const loaded =
        await StorageService.loadData<typeof podcasts>('test-podcasts');

      expect(loaded).toEqual(podcasts);
      expect(loaded![0].title).toBe('Test Podcast');
    });
  });

  describe('playback position storage', () => {
    it('should save and load playback position for episode', async () => {
      await StorageService.savePlaybackPosition('episode-123', 1500);
      const position = await StorageService.loadPlaybackPosition('episode-123');

      expect(position).toBe(1500);
    });

    it('should return 0 for episode with no saved position', async () => {
      const position = await StorageService.loadPlaybackPosition('no-position');
      expect(position).toBe(0);
    });

    it('should handle multiple episodes independently', async () => {
      await StorageService.savePlaybackPosition('ep-1', 100);
      await StorageService.savePlaybackPosition('ep-2', 200);

      expect(await StorageService.loadPlaybackPosition('ep-1')).toBe(100);
      expect(await StorageService.loadPlaybackPosition('ep-2')).toBe(200);
    });
  });

  describe('history storage', () => {
    it('should save and load history', async () => {
      const history = [createMockListeningHistory()];

      await StorageService.saveHistory(history);
      const loaded = await StorageService.loadHistory();

      expect(loaded).toHaveLength(1);
      expect(loaded[0].episode.id).toBe(history[0].episode.id);
      expect(loaded[0].podcast.id).toBe(history[0].podcast.id);
      expect(loaded[0].completionPercentage).toBe(
        history[0].completionPercentage,
      );
      // completedAt becomes a string after JSON serialization
      expect(loaded[0].completedAt).toBe(history[0].completedAt.toISOString());
    });

    it('should return empty array when no history saved', async () => {
      const loaded = await StorageService.loadHistory();
      expect(loaded).toEqual([]);
    });
  });

  describe('removePlaybackPosition', () => {
    it('should remove playback position for episode', async () => {
      await StorageService.savePlaybackPosition('ep-remove', 1000);
      expect(await StorageService.loadPlaybackPosition('ep-remove')).toBe(1000);

      await StorageService.removePlaybackPosition('ep-remove');
      expect(await StorageService.loadPlaybackPosition('ep-remove')).toBe(0);
    });
  });

  describe('clearAllData', () => {
    it('should remove all app data', async () => {
      // Save some data first
      await StorageService.saveData('@k-pod/test-data', { id: '1' });
      await StorageService.savePlaybackPosition('ep-1', 500);

      // Clear everything
      await StorageService.clearAllData();

      // Verify it's gone
      expect(await StorageService.loadData('@k-pod/test-data')).toBeNull();
      expect(await StorageService.loadPlaybackPosition('ep-1')).toBe(0);
    });
  });

  describe('error handling', () => {
    // Storage failures are logged but never rethrown: callers fire-and-forget
    // these (e.g. position saves on the 1s progress tick), so a rethrow
    // became an unhandled promise rejection
    it('should resolve without throwing when saveData fails', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage full'),
      );

      await expect(
        StorageService.saveData('test-key', { data: 'test' }),
      ).resolves.toBeUndefined();
    });

    it('should return null when loadData fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
        new Error('Read error'),
      );

      await expect(StorageService.loadData('test-key')).resolves.toBeNull();
    });

    it('should resolve without throwing when removeData fails', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(
        new Error('Remove error'),
      );

      await expect(
        StorageService.removeData('test-key'),
      ).resolves.toBeUndefined();
    });
  });
});
