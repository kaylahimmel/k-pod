import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HeaderPodcast } from '../HeaderPodcast';
import { createMockFormattedPodcastDetail } from '../../../__mocks__';

describe('HeaderPodcast', () => {
  const mockOnUnsubscribe = jest.fn();
  const mockOnToggleDescription = jest.fn();
  const mockPodcast = createMockFormattedPodcastDetail();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders podcast information correctly', () => {
    const { getByText } = render(
      <HeaderPodcast
        podcast={mockPodcast}
        onUnsubscribe={mockOnUnsubscribe}
        showFullDescription={false}
        onToggleDescription={mockOnToggleDescription}
      />,
    );

    expect(getByText(mockPodcast.title)).toBeTruthy();
    expect(getByText(mockPodcast.author)).toBeTruthy();
    expect(getByText(mockPodcast.episodeCountLabel)).toBeTruthy();
  });

  it('displays Subscribed button', () => {
    const { getByText } = render(
      <HeaderPodcast
        podcast={mockPodcast}
        onUnsubscribe={mockOnUnsubscribe}
        showFullDescription={false}
        onToggleDescription={mockOnToggleDescription}
      />,
    );

    expect(getByText('Subscribed')).toBeTruthy();
  });

  it('calls onUnsubscribe when Subscribed button is pressed', () => {
    const { getByText } = render(
      <HeaderPodcast
        podcast={mockPodcast}
        onUnsubscribe={mockOnUnsubscribe}
        showFullDescription={false}
        onToggleDescription={mockOnToggleDescription}
      />,
    );

    fireEvent.press(getByText('Subscribed'));
    expect(mockOnUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleDescription when description is pressed', () => {
    const { getByText } = render(
      <HeaderPodcast
        podcast={mockPodcast}
        onUnsubscribe={mockOnUnsubscribe}
        showFullDescription={false}
        onToggleDescription={mockOnToggleDescription}
      />,
    );

    fireEvent.press(getByText(mockPodcast.description));
    expect(mockOnToggleDescription).toHaveBeenCalledTimes(1);
  });

  it('shows Show more when description is collapsed and long', () => {
    const longDescPodcast = createMockFormattedPodcastDetail({
      description:
        'This is a very long podcast description that exceeds 150 characters to test the Show more functionality. It needs to be really long to trigger the show more button to appear.',
    });

    const { getByText } = render(
      <HeaderPodcast
        podcast={longDescPodcast}
        onUnsubscribe={mockOnUnsubscribe}
        showFullDescription={false}
        onToggleDescription={mockOnToggleDescription}
      />,
    );

    expect(getByText('Show more')).toBeTruthy();
  });

  it('shows Show less when description is expanded and long', () => {
    const longDescPodcast = createMockFormattedPodcastDetail({
      description:
        'This is a very long podcast description that exceeds 150 characters to test the Show more functionality. It needs to be really long to trigger the show more button to appear.',
    });

    const { getByText } = render(
      <HeaderPodcast
        podcast={longDescPodcast}
        onUnsubscribe={mockOnUnsubscribe}
        showFullDescription={true}
        onToggleDescription={mockOnToggleDescription}
      />,
    );

    expect(getByText('Show less')).toBeTruthy();
  });

  it('displays Episodes section header', () => {
    const { getByText } = render(
      <HeaderPodcast
        podcast={mockPodcast}
        onUnsubscribe={mockOnUnsubscribe}
        showFullDescription={false}
        onToggleDescription={mockOnToggleDescription}
      />,
    );

    expect(getByText('Episodes')).toBeTruthy();
  });
});
