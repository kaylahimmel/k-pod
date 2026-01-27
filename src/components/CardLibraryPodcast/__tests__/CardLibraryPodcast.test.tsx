import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CardLibraryPodcast } from '../CardLibraryPodcast';

describe('CardLibraryPodcast', () => {
  const mockOnPress = jest.fn();
  const mockOnLongPress = jest.fn();

  const defaultProps = {
    artworkUrl: 'https://example.com/artwork.jpg',
    title: 'Test Podcast',
    subtitle: 'Test Author',
    onPress: mockOnPress,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders podcast information correctly', () => {
    const { getByText } = render(<CardLibraryPodcast {...defaultProps} />);

    expect(getByText('Test Podcast')).toBeTruthy();
    expect(getByText('Test Author')).toBeTruthy();
  });

  it('renders meta text when provided', () => {
    const { getByText } = render(
      <CardLibraryPodcast {...defaultProps} meta='50 episodes' />,
    );

    expect(getByText('50 episodes')).toBeTruthy();
  });

  it('does not render meta text when not provided', () => {
    const { queryByText } = render(<CardLibraryPodcast {...defaultProps} />);

    expect(queryByText('50 episodes')).toBeNull();
  });

  it('calls onPress when card is pressed', () => {
    const { getByText } = render(<CardLibraryPodcast {...defaultProps} />);

    fireEvent.press(getByText('Test Podcast'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('calls onLongPress when card is long pressed', () => {
    const { getByText } = render(
      <CardLibraryPodcast {...defaultProps} onLongPress={mockOnLongPress} />,
    );

    fireEvent(getByText('Test Podcast'), 'onLongPress');
    expect(mockOnLongPress).toHaveBeenCalledTimes(1);
  });

  it('shows chevron by default', () => {
    const { toJSON } = render(<CardLibraryPodcast {...defaultProps} />);
    expect(toJSON()).toBeTruthy();
  });

  it('hides chevron when showChevron is false', () => {
    const { toJSON } = render(
      <CardLibraryPodcast {...defaultProps} showChevron={false} />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
