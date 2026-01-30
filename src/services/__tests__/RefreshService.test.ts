import { AppState } from 'react-native';
import { RefreshService } from '../RefreshService';
import { RSSService } from '../RSSService';
import { podcastStore } from '../../stores';
import { createMockPodcast, createMockEpisode } from '../../__mocks__';

// Mock the RSSService
jest.mock('../RSSService', () => ({
  RSSService: {
    refreshEpisodes: jest.fn(),
  },
}));

// Mock AppState
jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(),
  },
}));

describe('RefreshService', () => {
  beforeEach(() => {
    // Reset store to initial state
    podcastStore.setState({
      podcasts: [],
      loading: false,
      error: null,
    });

    // Reset mocks
    jest.clearAllMocks();

    // Reset refresh timer
    RefreshService.resetRefreshTimer();
  });

  describe('refreshPodcast', () => {
    it('should refresh a single podcast and update store', async () => {
      const oldEpisodes = [createMockEpisode({ id: 'ep1' })];
      const podcast = createMockPodcast({ id: 'p1', episodes: oldEpisodes });
      podcastStore.setState({
        podcasts: [podcast],
        loading: false,
        error: null,
      });

      const newEpisodes = [
        createMockEpisode({ id: 'ep1' }),
        createMockEpisode({ id: 'ep2', title: 'New Episode' }),
      ];

      (RSSService.refreshEpisodes as jest.Mock).mockResolvedValue({
        success: true,
        data: newEpisodes,
      });

      const result = await RefreshService.refreshPodcast(podcast);

      expect(result.success).toBe(true);
      expect(result.newEpisodeCount).toBe(1);
      expect(result.podcastId).toBe('p1');
      expect(RSSService.refreshEpisodes).toHaveBeenCalledWith(
        'p1',
        podcast.rssUrl,
      );
    });

    it('should return error result when refresh fails', async () => {
      const podcast = createMockPodcast({ id: 'p1' });
      podcastStore.setState({
        podcasts: [podcast],
        loading: false,
        error: null,
      });

      (RSSService.refreshEpisodes as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Network error',
      });

      const result = await RefreshService.refreshPodcast(podcast);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.newEpisodeCount).toBe(0);
    });

    it('should count zero new episodes when no new episodes found', async () => {
      const episodes = [createMockEpisode({ id: 'ep1' })];
      const podcast = createMockPodcast({ id: 'p1', episodes });
      podcastStore.setState({
        podcasts: [podcast],
        loading: false,
        error: null,
      });

      (RSSService.refreshEpisodes as jest.Mock).mockResolvedValue({
        success: true,
        data: episodes, // Same episodes
      });

      const result = await RefreshService.refreshPodcast(podcast);

      expect(result.success).toBe(true);
      expect(result.newEpisodeCount).toBe(0);
    });
  });

  describe('refreshAllPodcasts', () => {
    it('should refresh all podcasts in parallel', async () => {
      const podcast1 = createMockPodcast({
        id: 'p1',
        rssUrl: 'https://feed1.com',
        episodes: [],
      });
      const podcast2 = createMockPodcast({
        id: 'p2',
        rssUrl: 'https://feed2.com',
        episodes: [],
      });
      podcastStore.setState({
        podcasts: [podcast1, podcast2],
        loading: false,
        error: null,
      });

      (RSSService.refreshEpisodes as jest.Mock).mockResolvedValue({
        success: true,
        data: [createMockEpisode({ id: 'new-ep' })],
      });

      const result = await RefreshService.refreshAllPodcasts();

      expect(result.totalPodcasts).toBe(2);
      expect(result.successCount).toBe(2);
      expect(result.failCount).toBe(0);
      expect(result.totalNewEpisodes).toBe(2); // 1 new episode per podcast
      expect(RSSService.refreshEpisodes).toHaveBeenCalledTimes(2);
    });

    it('should handle empty podcast list', async () => {
      podcastStore.setState({ podcasts: [], loading: false, error: null });

      const result = await RefreshService.refreshAllPodcasts();

      expect(result.totalPodcasts).toBe(0);
      expect(result.successCount).toBe(0);
      expect(result.results).toEqual([]);
      expect(RSSService.refreshEpisodes).not.toHaveBeenCalled();
    });

    it('should handle partial failures', async () => {
      const podcast1 = createMockPodcast({ id: 'p1', episodes: [] });
      const podcast2 = createMockPodcast({ id: 'p2', episodes: [] });
      podcastStore.setState({
        podcasts: [podcast1, podcast2],
        loading: false,
        error: null,
      });

      (RSSService.refreshEpisodes as jest.Mock)
        .mockResolvedValueOnce({ success: true, data: [] })
        .mockResolvedValueOnce({ success: false, error: 'Failed' });

      const result = await RefreshService.refreshAllPodcasts();

      expect(result.successCount).toBe(1);
      expect(result.failCount).toBe(1);
    });
  });

  describe('shouldRefresh', () => {
    it('should return true when never refreshed', () => {
      RefreshService.resetRefreshTimer();
      expect(RefreshService.shouldRefresh()).toBe(true);
    });

    it('should return false immediately after refresh', async () => {
      const podcast = createMockPodcast({ id: 'p1', episodes: [] });
      podcastStore.setState({
        podcasts: [podcast],
        loading: false,
        error: null,
      });

      (RSSService.refreshEpisodes as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      await RefreshService.refreshAllPodcasts();

      expect(RefreshService.shouldRefresh()).toBe(false);
    });
  });

  describe('getTimeSinceLastRefresh', () => {
    it('should return null when never refreshed', () => {
      RefreshService.resetRefreshTimer();
      expect(RefreshService.getTimeSinceLastRefresh()).toBeNull();
    });

    it('should return time since last refresh', async () => {
      const podcast = createMockPodcast({ id: 'p1', episodes: [] });
      podcastStore.setState({
        podcasts: [podcast],
        loading: false,
        error: null,
      });

      (RSSService.refreshEpisodes as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      await RefreshService.refreshAllPodcasts();

      const timeSince = RefreshService.getTimeSinceLastRefresh();
      expect(timeSince).not.toBeNull();
      expect(timeSince).toBeGreaterThanOrEqual(0);
      expect(timeSince).toBeLessThan(1000); // Should be less than 1 second
    });
  });

  describe('foreground refresh', () => {
    it('should add app state listener when started', () => {
      RefreshService.startForegroundRefresh();
      expect(AppState.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function),
      );
    });

    it('should remove listener when stopped', () => {
      const mockRemove = jest.fn();
      (AppState.addEventListener as jest.Mock).mockReturnValue({
        remove: mockRemove,
      });

      RefreshService.startForegroundRefresh();
      RefreshService.stopForegroundRefresh();

      expect(mockRemove).toHaveBeenCalled();
    });

    it('should not throw when stopping without starting', () => {
      expect(() => {
        RefreshService.stopForegroundRefresh();
      }).not.toThrow();
    });
  });

  describe('resetRefreshTimer', () => {
    it('should allow immediate refresh after reset', async () => {
      const podcast = createMockPodcast({ id: 'p1', episodes: [] });
      podcastStore.setState({
        podcasts: [podcast],
        loading: false,
        error: null,
      });

      (RSSService.refreshEpisodes as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      await RefreshService.refreshAllPodcasts();
      expect(RefreshService.shouldRefresh()).toBe(false);

      RefreshService.resetRefreshTimer();
      expect(RefreshService.shouldRefresh()).toBe(true);
    });
  });
});
