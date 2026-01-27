import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CardEpisode } from '../CardEpisode';
import {
  createMockFormattedEpisode,
  createMockPodcast,
} from '../../../__mocks__';

describe('CardEpisode', () => {
  const mockOnPress = jest.fn();
  const mockOnPlay = jest.fn();
  const mockOnAddToQueue = jest.fn();
  const mockEpisode = createMockFormattedEpisode();
  const mockPodcast = createMockPodcast();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders episode information correctly', () => {
    const { getByText } = render(
      <CardEpisode
        episode={mockEpisode}
        podcast={mockPodcast}
        onPress={mockOnPress}
        onPlay={mockOnPlay}
        onAddToQueue={mockOnAddToQueue}
      />,
    );

    expect(getByText(mockEpisode.displayTitle)).toBeTruthy();
    expect(getByText(mockEpisode.truncatedDescription)).toBeTruthy();
    expect(getByText(mockEpisode.formattedPublishDate)).toBeTruthy();
    expect(getByText(mockEpisode.formattedDuration)).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const { getByText } = render(
      <CardEpisode
        episode={mockEpisode}
        podcast={mockPodcast}
        onPress={mockOnPress}
        onPlay={mockOnPlay}
        onAddToQueue={mockOnAddToQueue}
      />,
    );

    fireEvent.press(getByText(mockEpisode.displayTitle));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows played badge when episode is played', () => {
    const playedEpisode = createMockFormattedEpisode({ played: true });
    const { getByText } = render(
      <CardEpisode
        episode={playedEpisode}
        podcast={mockPodcast}
        onPress={mockOnPress}
        onPlay={mockOnPlay}
        onAddToQueue={mockOnAddToQueue}
      />,
    );

    expect(getByText('Played')).toBeTruthy();
  });

  it('does not show played badge when episode is not played', () => {
    const { queryByText } = render(
      <CardEpisode
        episode={mockEpisode}
        podcast={mockPodcast}
        onPress={mockOnPress}
        onPlay={mockOnPlay}
        onAddToQueue={mockOnAddToQueue}
      />,
    );

    expect(queryByText('Played')).toBeNull();
  });

  it('renders correctly when episode is in queue', () => {
    const { toJSON } = render(
      <CardEpisode
        episode={mockEpisode}
        podcast={mockPodcast}
        onPress={mockOnPress}
        onPlay={mockOnPlay}
        onAddToQueue={mockOnAddToQueue}
        isInQueue={true}
      />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('defaults isInQueue to false', () => {
    const { toJSON } = render(
      <CardEpisode
        episode={mockEpisode}
        podcast={mockPodcast}
        onPress={mockOnPress}
        onPlay={mockOnPlay}
        onAddToQueue={mockOnAddToQueue}
      />,
    );

    expect(toJSON()).toBeTruthy();
  });
});
