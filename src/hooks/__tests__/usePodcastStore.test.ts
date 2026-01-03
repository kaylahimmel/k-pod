import { renderHook, act } from '@testing-library/react-native';
import { usePodcastStore } from '../usePodcastStore';
import {podcastStore} from '../../stores';
import { Podcast } from '../../models';

describe('usePodcastStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    podcastStore.setState({
      podcasts: [],
      loading: false,
      error: null,
    });
  });

  describe('addPodcast', () => {
    it('should add a podcast to the store', () => {
      const newPodcast: Podcast = {
        id: '1',
        title: 'Test Podcast',
        description: 'A test podcast',
        artworkUrl: 'https://example.com/image.jpg',
        rssUrl: 'https://example.com/feed',
        author: 'Test Author',
        episodes: [],
        subscribeDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      const { result } = renderHook(() => usePodcastStore());

      act(() => {
        result.current.addPodcast(newPodcast);
      });

      expect(result.current.podcasts).toHaveLength(1);
      expect(result.current.podcasts[0]).toEqual(newPodcast);
    });

    it('should not add duplicate podcasts', () => {
      const podcast: Podcast = {
        id: '1',
        title: 'Test Podcast',
        description: 'A test podcast',
        artworkUrl: 'https://example.com/image.jpg',
        rssUrl: 'https://example.com/feed',
        author: 'Test Author',
        episodes: [],
        subscribeDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      const { result } = renderHook(() => usePodcastStore());

      act(() => {
        result.current.addPodcast(podcast);
        result.current.addPodcast(podcast);
      });

      expect(result.current.podcasts).toHaveLength(1);
    });
  });

  describe('removePodcast', () => {
    it('should remove a podcast from the store', () => {
      const podcast: Podcast = {
        id: '1',
        title: 'Test Podcast',
        description: 'A test podcast',
        artworkUrl: 'https://example.com/image.jpg',
        rssUrl: 'https://example.com/feed',
        author: 'Test Author',
        episodes: [],
        subscribeDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      const { result } = renderHook(() => usePodcastStore());

      act(() => {
        result.current.addPodcast(podcast);
      });

      act(() => {
        result.current.removePodcast('1');
      });

      expect(result.current.podcasts).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should handle loading and error states', () => {
      const { result } = renderHook(() => usePodcastStore());

      act(() => {
        result.current.setLoading(true);
      });
      expect(result.current.loading).toBe(true);

      act(() => {
        result.current.setLoading(false);
        result.current.setError('Failed to fetch');
      });
      expect(result.current.error).toBe('Failed to fetch');
    });
  });

  it('manages loading and error states', () => {
    const { result } = renderHook(() => usePodcastStore());

    expect(result.current.loading).toBe(false);

    act(() => {
      result.current.setLoading(true);
    });
    expect(result.current.loading).toBe(true);

    act(() => {
      result.current.setError('Failed to fetch');
    });
    expect(result.current.error).toBe('Failed to fetch');

    act(() => {
      result.current.setError(null);
    });
    expect(result.current.error).toBeNull();

  });
});
