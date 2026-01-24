import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CardNowPlaying } from '../CardNowPlaying';
import { FormattedQueueItem } from '../../../screens/QueueScreen/Queue.types';

describe('CardNowPlaying', () => {
  const mockOnPress = jest.fn();

  const createMockQueueItem = (
    overrides?: Partial<FormattedQueueItem>,
  ): FormattedQueueItem => ({
    id: 'queue-1',
    episodeId: 'ep-1',
    episodeTitle: 'Test Episode Title',
    displayTitle: 'Test Episode',
    podcastTitle: 'Test Podcast',
    podcastArtworkUrl: 'https://example.com/artwork.jpg',
    duration: 3600,
    formattedDuration: '1 hr',
    position: 0,
    positionLabel: '1',
    isCurrentlyPlaying: true,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Playing State', () => {
    it('should display NOW PLAYING label when isPlaying is true', () => {
      const item = createMockQueueItem();
      const { getByText } = render(
        <CardNowPlaying item={item} isPlaying={true} onPress={mockOnPress} />,
      );

      expect(getByText('NOW PLAYING')).toBeTruthy();
    });

    it('should display volume-high icon when isPlaying is true', () => {
      const item = createMockQueueItem();
      const { getByText } = render(
        <CardNowPlaying item={item} isPlaying={true} onPress={mockOnPress} />,
      );

      // Icon is mocked to render the icon name as text
      expect(getByText('volume-high')).toBeTruthy();
    });
  });

  describe('Paused State', () => {
    it('should display PAUSED label when isPlaying is false', () => {
      const item = createMockQueueItem();
      const { getByText } = render(
        <CardNowPlaying item={item} isPlaying={false} onPress={mockOnPress} />,
      );

      expect(getByText('PAUSED')).toBeTruthy();
    });

    it('should display pause icon when isPlaying is false', () => {
      const item = createMockQueueItem();
      const { getByText } = render(
        <CardNowPlaying item={item} isPlaying={false} onPress={mockOnPress} />,
      );

      // Icon is mocked to render the icon name as text
      expect(getByText('pause')).toBeTruthy();
    });
  });

  describe('Episode Information', () => {
    it('should display episode title', () => {
      const item = createMockQueueItem({ displayTitle: 'My Episode' });
      const { getByText } = render(
        <CardNowPlaying item={item} isPlaying={true} onPress={mockOnPress} />,
      );

      expect(getByText('My Episode')).toBeTruthy();
    });

    it('should display podcast title', () => {
      const item = createMockQueueItem({ podcastTitle: 'My Podcast' });
      const { getByText } = render(
        <CardNowPlaying item={item} isPlaying={true} onPress={mockOnPress} />,
      );

      expect(getByText('My Podcast')).toBeTruthy();
    });

    it('should display formatted duration', () => {
      const item = createMockQueueItem({ formattedDuration: '45 min' });
      const { getByText } = render(
        <CardNowPlaying item={item} isPlaying={true} onPress={mockOnPress} />,
      );

      expect(getByText('45 min')).toBeTruthy();
    });
  });

  describe('Artwork', () => {
    it('should display artwork image when podcastArtworkUrl is provided', () => {
      const item = createMockQueueItem({
        podcastArtworkUrl: 'https://example.com/artwork.jpg',
      });
      const { UNSAFE_getByType } = render(
        <CardNowPlaying item={item} isPlaying={true} onPress={mockOnPress} />,
      );

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Image } = require('react-native');
      const image = UNSAFE_getByType(Image);
      expect(image.props.source.uri).toBe('https://example.com/artwork.jpg');
    });

    it('should display placeholder icon when podcastArtworkUrl is empty', () => {
      const item = createMockQueueItem({ podcastArtworkUrl: '' });
      const { getByText } = render(
        <CardNowPlaying item={item} isPlaying={true} onPress={mockOnPress} />,
      );

      // Placeholder icon is musical-notes
      expect(getByText('musical-notes')).toBeTruthy();
    });
  });

  describe('Interaction', () => {
    it('should call onPress when pressed', () => {
      const item = createMockQueueItem();
      const { getByText } = render(
        <CardNowPlaying item={item} isPlaying={true} onPress={mockOnPress} />,
      );

      fireEvent.press(getByText('NOW PLAYING'));

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should call onPress when pressed in paused state', () => {
      const item = createMockQueueItem();
      const { getByText } = render(
        <CardNowPlaying item={item} isPlaying={false} onPress={mockOnPress} />,
      );

      fireEvent.press(getByText('PAUSED'));

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Different Data', () => {
    it('should render with different episode data', () => {
      const item = createMockQueueItem({
        displayTitle: 'Interview with CEO',
        podcastTitle: 'Business Weekly',
        formattedDuration: '2 hr 30 min',
      });

      const { getByText } = render(
        <CardNowPlaying item={item} isPlaying={true} onPress={mockOnPress} />,
      );

      expect(getByText('Interview with CEO')).toBeTruthy();
      expect(getByText('Business Weekly')).toBeTruthy();
      expect(getByText('2 hr 30 min')).toBeTruthy();
    });

    it('should handle long episode titles', () => {
      const item = createMockQueueItem({
        displayTitle:
          'This is a very long episode title that should be truncated by numberOfLines prop',
      });

      const { getByText } = render(
        <CardNowPlaying item={item} isPlaying={true} onPress={mockOnPress} />,
      );

      expect(
        getByText(
          'This is a very long episode title that should be truncated by numberOfLines prop',
        ),
      ).toBeTruthy();
    });
  });
});
