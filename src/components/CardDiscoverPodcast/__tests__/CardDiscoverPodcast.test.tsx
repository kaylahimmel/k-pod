import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DiscoveryPodcastCard } from '../CardDiscoverPodcast';
import { createMockFormattedDiscoveryPodcast } from '../../../__mocks__';

describe('DiscoveryPodcastCard', () => {
  const mockOnPress = jest.fn();
  const mockOnSubscribe = jest.fn();
  const mockPodcast = createMockFormattedDiscoveryPodcast();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders podcast information correctly', () => {
    const { getByText } = render(
      <DiscoveryPodcastCard
        podcast={mockPodcast}
        isSubscribed={false}
        onPress={mockOnPress}
        onSubscribe={mockOnSubscribe}
      />,
    );

    expect(getByText(mockPodcast.displayTitle)).toBeTruthy();
    expect(getByText(mockPodcast.author)).toBeTruthy();
    expect(getByText(mockPodcast.genre)).toBeTruthy();
    expect(getByText(mockPodcast.episodeCountLabel)).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const { getByText } = render(
      <DiscoveryPodcastCard
        podcast={mockPodcast}
        isSubscribed={false}
        onPress={mockOnPress}
        onSubscribe={mockOnSubscribe}
      />,
    );

    fireEvent.press(getByText(mockPodcast.displayTitle));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders correctly when not subscribed', () => {
    const { toJSON } = render(
      <DiscoveryPodcastCard
        podcast={mockPodcast}
        isSubscribed={false}
        onPress={mockOnPress}
        onSubscribe={mockOnSubscribe}
      />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders correctly when subscribed', () => {
    const { toJSON } = render(
      <DiscoveryPodcastCard
        podcast={mockPodcast}
        isSubscribed={true}
        onPress={mockOnPress}
        onSubscribe={mockOnSubscribe}
      />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom podcast data', () => {
    const customPodcast = createMockFormattedDiscoveryPodcast({
      displayTitle: 'Custom Podcast',
      author: 'Custom Author',
      genre: 'Comedy',
      episodeCountLabel: '50 episodes',
    });

    const { getByText } = render(
      <DiscoveryPodcastCard
        podcast={customPodcast}
        isSubscribed={false}
        onPress={mockOnPress}
        onSubscribe={mockOnSubscribe}
      />,
    );

    expect(getByText('Custom Podcast')).toBeTruthy();
    expect(getByText('Custom Author')).toBeTruthy();
    expect(getByText('Comedy')).toBeTruthy();
    expect(getByText('50 episodes')).toBeTruthy();
  });
});
