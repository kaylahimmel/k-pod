import { podcastStore } from '../podcastStore';
import { createMockPodcast, createMockEpisode } from '../../__mocks__';

describe('podcastStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    podcastStore.setState({
      podcasts: [],
      loading: false,
      error: null,
    });
  });

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const state = podcastStore.getState();
      expect(state.podcasts).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('setPodcasts', () => {
    it('should set the podcasts array', () => {
      const podcasts = [
        createMockPodcast({ id: 'p1' }),
        createMockPodcast({ id: 'p2' }),
      ];
      podcastStore.getState().setPodcasts(podcasts);
      expect(podcastStore.getState().podcasts).toEqual(podcasts);
    });

    it('should replace existing podcasts', () => {
      const oldPodcasts = [createMockPodcast({ id: 'old' })];
      const newPodcasts = [createMockPodcast({ id: 'new' })];

      podcastStore.getState().setPodcasts(oldPodcasts);
      podcastStore.getState().setPodcasts(newPodcasts);

      expect(podcastStore.getState().podcasts).toEqual(newPodcasts);
    });
  });

  describe('addPodcast', () => {
    it('should add a podcast to the list', () => {
      const podcast = createMockPodcast({ id: 'p1' });
      podcastStore.getState().addPodcast(podcast);
      expect(podcastStore.getState().podcasts).toContainEqual(podcast);
    });

    it('should not add duplicate podcasts', () => {
      const podcast = createMockPodcast({ id: 'p1' });
      podcastStore.getState().addPodcast(podcast);
      podcastStore.getState().addPodcast(podcast);
      expect(podcastStore.getState().podcasts).toHaveLength(1);
    });

    it('should append to existing podcasts', () => {
      const podcast1 = createMockPodcast({ id: 'p1' });
      const podcast2 = createMockPodcast({ id: 'p2' });

      podcastStore.getState().addPodcast(podcast1);
      podcastStore.getState().addPodcast(podcast2);

      expect(podcastStore.getState().podcasts).toHaveLength(2);
    });
  });

  describe('removePodcast', () => {
    it('should remove a podcast by id', () => {
      const podcast1 = createMockPodcast({ id: 'p1' });
      const podcast2 = createMockPodcast({ id: 'p2' });

      podcastStore.getState().setPodcasts([podcast1, podcast2]);
      podcastStore.getState().removePodcast('p1');

      const podcasts = podcastStore.getState().podcasts;
      expect(podcasts).toHaveLength(1);
      expect(podcasts[0].id).toBe('p2');
    });

    it('should not throw when removing non-existent podcast', () => {
      const podcast = createMockPodcast({ id: 'p1' });
      podcastStore.getState().setPodcasts([podcast]);

      expect(() => {
        podcastStore.getState().removePodcast('non-existent');
      }).not.toThrow();

      expect(podcastStore.getState().podcasts).toHaveLength(1);
    });
  });

  describe('updatePodcastEpisodes', () => {
    it('should update episodes for a podcast', () => {
      const oldEpisodes = [createMockEpisode({ id: 'ep1', played: false })];
      const podcast = createMockPodcast({ id: 'p1', episodes: oldEpisodes });
      podcastStore.getState().setPodcasts([podcast]);

      const newEpisodes = [
        createMockEpisode({ id: 'ep1', title: 'Updated Episode 1' }),
        createMockEpisode({ id: 'ep2', title: 'New Episode 2' }),
      ];

      podcastStore.getState().updatePodcastEpisodes('p1', newEpisodes);

      const updatedPodcast = podcastStore.getState().podcasts[0];
      expect(updatedPodcast.episodes).toHaveLength(2);
    });

    it('should preserve played state for existing episodes', () => {
      const oldEpisodes = [
        createMockEpisode({ id: 'ep1', played: true }),
        createMockEpisode({ id: 'ep2', played: false }),
      ];
      const podcast = createMockPodcast({ id: 'p1', episodes: oldEpisodes });
      podcastStore.getState().setPodcasts([podcast]);

      const newEpisodes = [
        createMockEpisode({ id: 'ep1', played: false, title: 'Updated' }), // New data has played: false
        createMockEpisode({ id: 'ep2', played: true, title: 'Updated' }), // New data has played: true
        createMockEpisode({ id: 'ep3', played: false, title: 'Brand New' }),
      ];

      podcastStore.getState().updatePodcastEpisodes('p1', newEpisodes);

      const updatedPodcast = podcastStore.getState().podcasts[0];
      // Existing episode should preserve its played state
      expect(updatedPodcast.episodes.find((e) => e.id === 'ep1')?.played).toBe(
        true,
      );
      expect(updatedPodcast.episodes.find((e) => e.id === 'ep2')?.played).toBe(
        false,
      );
      // New episode should use the provided played state
      expect(updatedPodcast.episodes.find((e) => e.id === 'ep3')?.played).toBe(
        false,
      );
    });

    it('should update lastUpdated timestamp', () => {
      const oldDate = '2024-01-01T00:00:00Z';
      const podcast = createMockPodcast({
        id: 'p1',
        lastUpdated: oldDate,
        episodes: [],
      });
      podcastStore.getState().setPodcasts([podcast]);

      const newEpisodes = [createMockEpisode({ id: 'ep1' })];
      podcastStore.getState().updatePodcastEpisodes('p1', newEpisodes);

      const updatedPodcast = podcastStore.getState().podcasts[0];
      expect(updatedPodcast.lastUpdated).not.toBe(oldDate);
      expect(new Date(updatedPodcast.lastUpdated).getTime()).toBeGreaterThan(
        new Date(oldDate).getTime(),
      );
    });

    it('should not modify state for non-existent podcast', () => {
      const podcast = createMockPodcast({ id: 'p1', episodes: [] });
      podcastStore.getState().setPodcasts([podcast]);

      const initialState = podcastStore.getState().podcasts;

      podcastStore
        .getState()
        .updatePodcastEpisodes('non-existent', [createMockEpisode()]);

      expect(podcastStore.getState().podcasts).toEqual(initialState);
    });

    it('should not affect other podcasts', () => {
      const podcast1 = createMockPodcast({
        id: 'p1',
        episodes: [createMockEpisode({ id: 'ep1' })],
      });
      const podcast2 = createMockPodcast({
        id: 'p2',
        episodes: [createMockEpisode({ id: 'ep2' })],
      });
      podcastStore.getState().setPodcasts([podcast1, podcast2]);

      const newEpisodes = [createMockEpisode({ id: 'new-ep' })];
      podcastStore.getState().updatePodcastEpisodes('p1', newEpisodes);

      const podcasts = podcastStore.getState().podcasts;
      expect(podcasts.find((p) => p.id === 'p2')?.episodes[0].id).toBe('ep2');
    });
  });

  describe('setLoading', () => {
    it('should set loading to true', () => {
      podcastStore.getState().setLoading(true);
      expect(podcastStore.getState().loading).toBe(true);
    });

    it('should set loading to false', () => {
      podcastStore.getState().setLoading(true);
      podcastStore.getState().setLoading(false);
      expect(podcastStore.getState().loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      podcastStore.getState().setError('Test error');
      expect(podcastStore.getState().error).toBe('Test error');
    });

    it('should clear error with null', () => {
      podcastStore.getState().setError('Test error');
      podcastStore.getState().setError(null);
      expect(podcastStore.getState().error).toBeNull();
    });
  });
});
