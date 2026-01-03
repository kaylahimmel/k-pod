import { renderHook, act } from '@testing-library/react-native';
import queueStore from '../../stores/queueStore';
import { useQueueStore } from '../useQueueStore';
import { QueueItem } from '../../models/QueueItem';
import { Episode } from '../../models/Episode';
import { Podcast } from '../../models/Podcast';

describe('useQueueStore', () => {
  const mockEpisode: Episode = {
    id: 'e1',
    podcastId: 'p1',
    title: 'Episode 1',
    description: 'Test episode',
    audioUrl: 'https://example.com/audio.mp3',
    duration: 3600,
    publishDate: new Date().toISOString(),
    played: false,
  };

  const mockPodcast: Podcast = {
    id: 'p1',
    title: 'Test Podcast',
    author: 'Test Author',
    rssUrl: 'https://example.com/rss',
    artworkUrl: 'https://example.com/artwork.jpg',
    description: 'Test podcast description',
    subscribeDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    episodes: [],
  };

  const mockQueueItem: QueueItem = {
    id: 'q1',
    episode: mockEpisode,
    podcast: mockPodcast,
    position: 0,
  };

  afterEach(() => {
    queueStore.getState().setQueue([]);
    queueStore.getState().setCurrentIndex(0);
  });

  it('exposes queue array and addToQueue action', () => {
    const { result } = renderHook(() => useQueueStore());

    expect(Array.isArray(result.current.queue)).toBe(true);

    act(() => {
      result.current.addToQueue(mockQueueItem);
    });

    expect(result.current.queue.length).toBe(1);
  });

  it('removes items from queue by id', () => {
    const { result } = renderHook(() => useQueueStore());

    act(() => {
      result.current.addToQueue(mockQueueItem);
    });
    expect(result.current.queue.length).toBe(1);

    act(() => {
      result.current.removeFromQueue('q1');
    });
    expect(result.current.queue.length).toBe(0);
  });

  it('clears entire queue and resets index', () => {
    const { result } = renderHook(() => useQueueStore());

    act(() => {
      result.current.addToQueue(mockQueueItem);
      result.current.setCurrentIndex(5);
    });

    act(() => {
      result.current.clearQueue();
    });

    expect(result.current.queue.length).toBe(0);
    expect(result.current.currentIndex).toBe(0);
  });

  it('sets queue and tracks current index', () => {
    const { result } = renderHook(() => useQueueStore());

    act(() => {
      result.current.setQueue([mockQueueItem]);
    });
    expect(result.current.queue.length).toBe(1);

    act(() => {
      result.current.setCurrentIndex(3);
    });
    expect(result.current.currentIndex).toBe(3);
  });

  it('reorders queue items', () => {
    const { result } = renderHook(() => useQueueStore());

    const item2: QueueItem = { ...mockQueueItem, id: 'q2' };
    const item3: QueueItem = { ...mockQueueItem, id: 'q3' };

    act(() => {
      result.current.setQueue([mockQueueItem, item2, item3]);
    });

    act(() => {
      result.current.reorderQueue(0, 2);
    });

    expect(result.current.queue[0].id).toBe('q2');
    expect(result.current.queue[1].id).toBe('q3');
    expect(result.current.queue[2].id).toBe('q1');
  });
});
