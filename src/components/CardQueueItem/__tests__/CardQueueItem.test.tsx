import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CardQueueItem } from '../CardQueueItem';
import { createMockFormattedQueueItem } from '../../../__mocks__';

// Mock react-native-gesture-handler using React Fragment to avoid require() warnings
jest.mock('react-native-gesture-handler', () => ({
  Swipeable: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock react-native-draggable-flatlist
jest.mock('react-native-draggable-flatlist', () => ({
  ScaleDecorator: ({ children }: { children: React.ReactNode }) => children,
  OpacityDecorator: ({ children }: { children: React.ReactNode }) => children,
}));

describe('CardQueueItem', () => {
  const mockDrag = jest.fn();
  const mockOnRemove = jest.fn();
  const mockOnPlay = jest.fn();
  const mockOnPress = jest.fn();
  const mockQueueItem = createMockFormattedQueueItem();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders queue item information correctly', () => {
    const { getByText } = render(
      <CardQueueItem
        item={mockQueueItem}
        drag={mockDrag}
        isActive={false}
        onRemove={mockOnRemove}
        onPlay={mockOnPlay}
        onPress={mockOnPress}
      />,
    );

    expect(getByText(mockQueueItem.displayTitle)).toBeTruthy();
    expect(getByText(mockQueueItem.podcastTitle)).toBeTruthy();
    expect(getByText(mockQueueItem.formattedDuration)).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const { getByText } = render(
      <CardQueueItem
        item={mockQueueItem}
        drag={mockDrag}
        isActive={false}
        onRemove={mockOnRemove}
        onPlay={mockOnPlay}
        onPress={mockOnPress}
      />,
    );

    fireEvent.press(getByText(mockQueueItem.displayTitle));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders with currently playing styling', () => {
    const playingItem = createMockFormattedQueueItem({
      isCurrentlyPlaying: true,
      positionLabel: '15:30 / 1:00:00',
    });

    const { getByText, toJSON } = render(
      <CardQueueItem
        item={playingItem}
        drag={mockDrag}
        isActive={false}
        onRemove={mockOnRemove}
        onPlay={mockOnPlay}
        onPress={mockOnPress}
      />,
    );

    expect(getByText('15:30 / 1:00:00')).toBeTruthy();
    expect(toJSON()).toBeTruthy();
  });

  it('renders with active/dragging styling', () => {
    const { toJSON } = render(
      <CardQueueItem
        item={mockQueueItem}
        drag={mockDrag}
        isActive={true}
        onRemove={mockOnRemove}
        onPlay={mockOnPlay}
        onPress={mockOnPress}
      />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders without OpacityDecorator when isDraggable is false', () => {
    const { toJSON } = render(
      <CardQueueItem
        item={mockQueueItem}
        drag={mockDrag}
        isActive={false}
        onRemove={mockOnRemove}
        onPlay={mockOnPlay}
        onPress={mockOnPress}
        isDraggable={false}
      />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom queue item data', () => {
    const customItem = createMockFormattedQueueItem({
      displayTitle: 'Custom Episode',
      podcastTitle: 'Custom Podcast',
      formattedDuration: '45:00',
    });

    const { getByText } = render(
      <CardQueueItem
        item={customItem}
        drag={mockDrag}
        isActive={false}
        onRemove={mockOnRemove}
        onPlay={mockOnPlay}
        onPress={mockOnPress}
      />,
    );

    expect(getByText('Custom Episode')).toBeTruthy();
    expect(getByText('Custom Podcast')).toBeTruthy();
    expect(getByText('45:00')).toBeTruthy();
  });
});
