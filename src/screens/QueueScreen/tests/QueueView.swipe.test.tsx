import React from 'react';
import { render, act } from '@testing-library/react-native';
import { QueueView } from '../QueueView';
import { queueStore } from '../../../stores';
import { createMockEpisode, createMockQueueItem } from '../../../__mocks__';

// Each Swipeable instance remembers whether it was swiped open, so counting
// mounts shows whether a card starts fresh or inherits that state
const mockSwipeableMount = jest.fn();
jest.mock('react-native-gesture-handler/Swipeable', () => {
  const { useEffect } = jest.requireActual('react');
  const MockSwipeable = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
      mockSwipeableMount();
    }, []);
    return children;
  };
  return { __esModule: true, default: MockSwipeable };
});

describe('QueueView swipe state', () => {
  it('should start the next playing card closed after a removal', async () => {
    const first = createMockQueueItem({
      id: 'item-1',
      episode: createMockEpisode({ id: 'episode-1' }),
    });
    const second = createMockQueueItem({
      id: 'item-2',
      episode: createMockEpisode({ id: 'episode-2' }),
    });
    queueStore.setState({ queue: [first, second], currentIndex: 0 });
    render(<QueueView />);
    mockSwipeableMount.mockClear();

    await act(async () => queueStore.getState().removeFromQueue(first.id));

    expect(mockSwipeableMount).toHaveBeenCalledTimes(1);
  });
});
