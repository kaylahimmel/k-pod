import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useQueueViewModel } from '../QueueViewModel';
import { FormattedQueueItem } from '../Queue.types';
import { queueStore, playerStore } from '../../../stores';
import {
  createMockEpisode,
  createMockPodcast,
  createMockQueueItem,
} from '../../../__mocks__';

describe('QueueViewModel', () => {
  const mockOnEpisodePress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    queueStore.setState({
      queue: [],
      currentIndex: 0,
    });
    playerStore.setState({
      currentEpisode: null,
      isPlaying: false,
      position: 0,
      duration: 0,
      speed: 1,
    });
  });

  describe('State Flags', () => {
    it('should return isEmpty true when queue is empty', () => {
      const { result } = renderHook(() => useQueueViewModel());

      expect(result.current.isEmpty).toBe(true);
      expect(result.current.hasItems).toBe(false);
    });

    it('should return hasItems true when queue has items', () => {
      queueStore.setState({
        queue: [createMockQueueItem()],
        currentIndex: 0,
      });

      const { result } = renderHook(() => useQueueViewModel());

      expect(result.current.isEmpty).toBe(false);
      expect(result.current.hasItems).toBe(true);
    });

    it('should return hasUpcoming true when there are items after currentIndex', () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({ id: 'q1' }),
          createMockQueueItem({ id: 'q2' }),
        ],
        currentIndex: 0,
      });

      const { result } = renderHook(() => useQueueViewModel());

      expect(result.current.hasUpcoming).toBe(true);
    });

    it('should return hasUpcoming false when at last item', () => {
      queueStore.setState({
        queue: [createMockQueueItem({ id: 'q1' })],
        currentIndex: 0,
      });

      const { result } = renderHook(() => useQueueViewModel());

      expect(result.current.hasUpcoming).toBe(false);
    });
  });

  describe('handleRemoveFromQueue', () => {
    it('should remove item from queue', () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({ id: 'q1' }),
          createMockQueueItem({ id: 'q2' }),
        ],
        currentIndex: 0,
      });

      const { result } = renderHook(() => useQueueViewModel());

      act(() => {
        result.current.handleRemoveFromQueue('q2');
      });

      expect(queueStore.getState().queue).toHaveLength(1);
      expect(queueStore.getState().queue[0].id).toBe('q1');
    });
  });

  describe('handleReorder', () => {
    it('should reorder items without affecting currentIndex when not moving current item', () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({ id: 'q1' }),
          createMockQueueItem({ id: 'q2' }),
          createMockQueueItem({ id: 'q3' }),
        ],
        currentIndex: 0,
      });

      const { result } = renderHook(() => useQueueViewModel());

      act(() => {
        result.current.handleReorder(1, 2);
      });

      const state = queueStore.getState();
      expect(state.currentIndex).toBe(0);
    });

    it('should update currentIndex when moving the currently playing item', () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({ id: 'q1' }),
          createMockQueueItem({ id: 'q2' }),
          createMockQueueItem({ id: 'q3' }),
        ],
        currentIndex: 0,
      });

      const { result } = renderHook(() => useQueueViewModel());

      act(() => {
        result.current.handleReorder(0, 2);
      });

      // Current item moved from 0 to 2, so currentIndex should be 2
      expect(queueStore.getState().currentIndex).toBe(2);
    });

    it('should adjust currentIndex when moving item to current position', () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({ id: 'q1' }),
          createMockQueueItem({ id: 'q2' }),
          createMockQueueItem({ id: 'q3' }),
        ],
        currentIndex: 1,
      });

      const { result } = renderHook(() => useQueueViewModel());

      // Move item from index 0 to index 1 (where current is)
      act(() => {
        result.current.handleReorder(0, 1);
      });

      // Since fromIndex < currentIndex, currentIndex should decrease
      expect(queueStore.getState().currentIndex).toBe(0);
    });

    it('should adjust currentIndex when moving item from after to current position', () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({ id: 'q1' }),
          createMockQueueItem({ id: 'q2' }),
          createMockQueueItem({ id: 'q3' }),
        ],
        currentIndex: 1,
      });

      const { result } = renderHook(() => useQueueViewModel());

      // Move item from index 2 to index 1 (where current is)
      act(() => {
        result.current.handleReorder(2, 1);
      });

      // Since fromIndex > currentIndex, currentIndex should increase
      expect(queueStore.getState().currentIndex).toBe(2);
    });

    it('should adjust currentIndex when item moves from before to after current', () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({ id: 'q1' }),
          createMockQueueItem({ id: 'q2' }),
          createMockQueueItem({ id: 'q3' }),
          createMockQueueItem({ id: 'q4' }),
        ],
        currentIndex: 1,
      });

      const { result } = renderHook(() => useQueueViewModel());

      // Move item from before current (0) to after current (2)
      act(() => {
        result.current.handleReorder(0, 2);
      });

      // Current should shift down by 1
      expect(queueStore.getState().currentIndex).toBe(0);
    });

    it('should adjust currentIndex when item moves from after to before current', () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({ id: 'q1' }),
          createMockQueueItem({ id: 'q2' }),
          createMockQueueItem({ id: 'q3' }),
          createMockQueueItem({ id: 'q4' }),
        ],
        currentIndex: 2,
      });

      const { result } = renderHook(() => useQueueViewModel());

      // Move item from after current (3) to before current (1)
      act(() => {
        result.current.handleReorder(3, 1);
      });

      // Current should shift up by 1
      expect(queueStore.getState().currentIndex).toBe(3);
    });
  });

  describe('handleClearQueue', () => {
    it('should show confirmation alert', () => {
      const alertSpy = jest.spyOn(Alert, 'alert');

      queueStore.setState({
        queue: [createMockQueueItem()],
        currentIndex: 0,
      });

      const { result } = renderHook(() => useQueueViewModel());

      act(() => {
        result.current.handleClearQueue();
      });

      expect(alertSpy).toHaveBeenCalledWith(
        'Clear Queue',
        'Are you sure you want to clear your entire queue? This cannot be undone.',
        expect.any(Array),
      );

      alertSpy.mockRestore();
    });

    it('should clear queue when confirmed', () => {
      const alertSpy = jest
        .spyOn(Alert, 'alert')
        .mockImplementation((_title, _message, buttons) => {
          if (buttons && buttons.length > 1) {
            const clearButton = buttons[1];
            if (clearButton.onPress) {
              clearButton.onPress();
            }
          }
        });

      queueStore.setState({
        queue: [
          createMockQueueItem({ id: 'q1' }),
          createMockQueueItem({ id: 'q2' }),
        ],
        currentIndex: 0,
      });

      const { result } = renderHook(() => useQueueViewModel());

      act(() => {
        result.current.handleClearQueue();
      });

      expect(queueStore.getState().queue).toHaveLength(0);

      alertSpy.mockRestore();
    });
  });

  describe('handlePlayItem', () => {
    it('should call onPlayItem callback with the queue item', () => {
      const mockOnPlayItem = jest.fn();
      const mockQueueItem = createMockQueueItem({ id: 'q3' });

      queueStore.setState({
        queue: [
          createMockQueueItem({ id: 'q1' }),
          createMockQueueItem({ id: 'q2' }),
          mockQueueItem,
        ],
        currentIndex: 0,
      });

      const { result } = renderHook(() =>
        useQueueViewModel(undefined, mockOnPlayItem),
      );
      const formattedItem = result.current.displayQueue[2]; // Third item

      act(() => {
        result.current.handlePlayItem(formattedItem);
      });

      // Verify callback was called with correct item
      expect(mockOnPlayItem).toHaveBeenCalledWith(mockQueueItem);
    });

    it('should not call onPlayItem when callback is not provided', () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({ id: 'q1' }),
          createMockQueueItem({ id: 'q2' }),
        ],
        currentIndex: 0,
      });

      const { result } = renderHook(() => useQueueViewModel());
      const formattedItem = result.current.displayQueue[0]; // First item

      // Should not throw
      expect(() => {
        act(() => {
          result.current.handlePlayItem(formattedItem);
        });
      }).not.toThrow();
    });

    it('should not call onPlayItem when item is not found in queue', () => {
      const mockOnPlayItem = jest.fn();

      queueStore.setState({
        queue: [createMockQueueItem({ id: 'q1' })],
        currentIndex: 0,
      });

      const { result } = renderHook(() =>
        useQueueViewModel(undefined, mockOnPlayItem),
      );

      // Create a fake formatted item that doesn't exist in queue
      const fakeItem: FormattedQueueItem = {
        id: 'non-existent',
        episodeId: 'fake-ep',
        episodeTitle: 'Fake',
        displayTitle: 'Fake',
        podcastTitle: 'Fake Podcast',
        podcastArtworkUrl: '',
        duration: 1800,
        formattedDuration: '30:00',
        position: 0,
        positionLabel: '#1',
        isCurrentlyPlaying: false,
      };

      act(() => {
        result.current.handlePlayItem(fakeItem);
      });

      expect(mockOnPlayItem).not.toHaveBeenCalled();
    });
  });

  describe('handleEpisodePress', () => {
    it('should call onEpisodePress callback with correct episode and podcast IDs and queue item', () => {
      const mockEpisode = createMockEpisode({
        id: 'ep-123',
        podcastId: 'pod-456',
      });
      const mockPodcast = createMockPodcast({ id: 'pod-456' });
      const mockQueueItem = createMockQueueItem({
        id: 'q1',
        episode: mockEpisode,
        podcast: mockPodcast,
      });

      queueStore.setState({
        queue: [mockQueueItem],
        currentIndex: 0,
      });

      const { result } = renderHook(() =>
        useQueueViewModel(mockOnEpisodePress),
      );
      const formattedItem = result.current.displayQueue[0];

      act(() => {
        result.current.handleEpisodePress(formattedItem);
      });

      expect(mockOnEpisodePress).toHaveBeenCalledWith(
        'ep-123',
        'pod-456',
        mockQueueItem,
      );
    });

    it('should not call onEpisodePress when callback is not provided', () => {
      queueStore.setState({
        queue: [createMockQueueItem({ id: 'q1' })],
        currentIndex: 0,
      });

      const { result } = renderHook(() => useQueueViewModel());
      const formattedItem = result.current.displayQueue[0];

      // Should not throw
      act(() => {
        result.current.handleEpisodePress(formattedItem);
      });

      expect(mockOnEpisodePress).not.toHaveBeenCalled();
    });

    it('should not call onEpisodePress when item is not found in queue', () => {
      queueStore.setState({
        queue: [createMockQueueItem({ id: 'q1' })],
        currentIndex: 0,
      });

      const { result } = renderHook(() =>
        useQueueViewModel(mockOnEpisodePress),
      );

      // Create a fake formatted item that doesn't exist in queue
      const fakeItem: FormattedQueueItem = {
        id: 'non-existent',
        episodeId: 'fake-ep',
        episodeTitle: 'Fake',
        displayTitle: 'Fake',
        podcastTitle: 'Fake Podcast',
        podcastArtworkUrl: '',
        duration: 1800,
        formattedDuration: '30:00',
        position: 0,
        positionLabel: '#1',
        isCurrentlyPlaying: false,
      };

      act(() => {
        result.current.handleEpisodePress(fakeItem);
      });

      expect(mockOnEpisodePress).not.toHaveBeenCalled();
    });
  });

  describe('getOriginalQueueItem', () => {
    it('should return the original queue item by id', () => {
      const mockItem = createMockQueueItem({ id: 'q1' });
      queueStore.setState({
        queue: [mockItem],
        currentIndex: 0,
      });

      const { result } = renderHook(() => useQueueViewModel());

      const found = result.current.getOriginalQueueItem('q1');
      expect(found).toEqual(mockItem);
    });

    it('should return undefined for non-existent id', () => {
      queueStore.setState({
        queue: [createMockQueueItem({ id: 'q1' })],
        currentIndex: 0,
      });

      const { result } = renderHook(() => useQueueViewModel());

      const found = result.current.getOriginalQueueItem('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('Formatted Data', () => {
    it('should provide formatted queue items', () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({
            id: 'q1',
            episode: createMockEpisode({ title: 'Episode 1', duration: 1800 }),
            podcast: createMockPodcast({ title: 'Podcast 1' }),
          }),
        ],
        currentIndex: 0,
      });

      const { result } = renderHook(() => useQueueViewModel());

      expect(result.current.formattedQueue).toHaveLength(1);
      expect(result.current.formattedQueue[0].episodeTitle).toBe('Episode 1');
      expect(result.current.formattedQueue[0].podcastTitle).toBe('Podcast 1');
    });

    it('should provide queue stats', () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({
            episode: createMockEpisode({ duration: 1800 }),
          }),
          createMockQueueItem({
            episode: createMockEpisode({ duration: 1800 }),
          }),
        ],
        currentIndex: 0,
      });

      const { result } = renderHook(() => useQueueViewModel());

      expect(result.current.queueStats.count).toBe('2 episodes');
      expect(result.current.queueStats.remainingTime).toBe('1h 0m remaining');
    });

    it('should identify currently playing item', () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({ id: 'q1' }),
          createMockQueueItem({ id: 'q2' }),
        ],
        currentIndex: 0,
      });

      const { result } = renderHook(() => useQueueViewModel());

      expect(result.current.currentlyPlaying).not.toBeNull();
      expect(result.current.currentlyPlaying?.id).toBe('q1');
    });

    it('should provide upcoming items', () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({ id: 'q1' }),
          createMockQueueItem({ id: 'q2' }),
          createMockQueueItem({ id: 'q3' }),
        ],
        currentIndex: 0,
      });

      const { result } = renderHook(() => useQueueViewModel());

      expect(result.current.upcomingItems).toHaveLength(2);
      expect(result.current.upcomingItems[0].id).toBe('q2');
      expect(result.current.upcomingItems[1].id).toBe('q3');
    });
  });
});
