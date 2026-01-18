import { StorageService } from '../StorageService';

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

      await StorageService.savePodcasts(podcasts);
      const loaded = await StorageService.loadPodcasts();

      expect(loaded).toEqual(podcasts);
      expect(loaded[0].title).toBe('Test Podcast');
    });

    it('should return empty array when no podcasts saved', async () => {
      const loaded = await StorageService.loadPodcasts();
      expect(loaded).toEqual([]);
    });
  });

  describe('settings storage', () => {
    it('should save and load settings', async () => {
      const settings = {
        autoPlayNext: true,
        defaultSpeed: 1.5,
        downloadOnWiFi: true,
        skipForwardSeconds: 30,
        skipBackwardSeconds: 15,
      };

      await StorageService.saveSettings(settings);
      const loaded = await StorageService.loadSettings();

      expect(loaded).toEqual(settings);
    });

    it('should return null when no settings saved', async () => {
      const loaded = await StorageService.loadSettings();
      expect(loaded).toBeNull();
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

  describe('clearAllData', () => {
    it('should remove all app data', async () => {
      // Save some data first
      await StorageService.savePodcasts([{ id: '1' } as any]);
      await StorageService.savePlaybackPosition('ep-1', 500);

      // Clear everything
      await StorageService.clearAllData();

      // Verify it's gone
      expect(await StorageService.loadPodcasts()).toEqual([]);
      expect(await StorageService.loadPlaybackPosition('ep-1')).toBe(0);
    });
  });
});
