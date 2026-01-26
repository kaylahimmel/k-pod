import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AddPodcastView } from '../AddPodcastView';
import { RSSService } from '../../../services';
import { podcastStore } from '../../../stores';
import { createMockPodcast, createMockEpisode } from '../../../__mocks__';

// Mock the services
jest.mock('../../../services', () => ({
  RSSService: {
    transformPodcastFromRSS: jest.fn(),
  },
}));

describe('AddPodcastView', () => {
  const mockOnDismiss = jest.fn();
  const mockOnGoToDiscover = jest.fn();

  const mockPodcast = createMockPodcast({
    id: 'podcast-1',
    title: 'Test Podcast',
    author: 'Test Author',
    description: 'A great test podcast about testing things.',
    artworkUrl: 'https://example.com/artwork.jpg',
    rssUrl: 'https://example.com/feed.xml',
    episodes: [
      createMockEpisode({
        id: 'ep-1',
        title: 'Episode 1',
        publishDate: '2024-06-15T00:00:00Z',
      }),
      createMockEpisode({
        id: 'ep-2',
        title: 'Episode 2',
        publishDate: '2024-06-14T00:00:00Z',
      }),
    ],
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnDismiss.mockClear();
    mockOnGoToDiscover.mockClear();
    podcastStore.setState({
      podcasts: [],
      loading: false,
      error: null,
    });
  });

  const renderAddPodcastView = () =>
    render(
      <AddPodcastView
        onDismiss={mockOnDismiss}
        onGoToDiscover={mockOnGoToDiscover}
      />,
    );

  describe('Idle State', () => {
    it('should display header with title and Cancel button', () => {
      const { getAllByText, getByText } = renderAddPodcastView();

      // "Add Podcast" appears in both header and button
      expect(getAllByText('Add Podcast').length).toBeGreaterThanOrEqual(1);
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should display RSS Feed URL label', () => {
      const { getByText } = renderAddPodcastView();

      expect(getByText('RSS Feed URL')).toBeTruthy();
    });

    it('should display URL input with placeholder', () => {
      const { getByLabelText } = renderAddPodcastView();

      const input = getByLabelText('RSS feed URL input');
      expect(input.props.placeholder).toBe('https://example.com/feed.xml');
    });

    it('should display Add Podcast button', () => {
      const { getByLabelText } = renderAddPodcastView();

      expect(getByLabelText('Add podcast')).toBeTruthy();
    });

    it('should display hint text', () => {
      const { getByText } = renderAddPodcastView();

      expect(
        getByText(/Enter the RSS feed URL of a podcast to subscribe/),
      ).toBeTruthy();
    });

    it('should not fetch when URL is empty and button is pressed', async () => {
      const { getByLabelText } = renderAddPodcastView();

      // Button is disabled when URL is empty, but we can still fire the event
      // The ViewModel should prevent fetching
      fireEvent.press(getByLabelText('Add podcast'));

      // RSSService should not be called because URL is empty
      expect(RSSService.transformPodcastFromRSS).not.toHaveBeenCalled();
    });

    it('should fetch when URL has content and button is pressed', async () => {
      (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Test error',
      });

      const { getByLabelText } = renderAddPodcastView();

      const input = getByLabelText('RSS feed URL input');
      fireEvent.changeText(input, 'https://example.com/feed.xml');
      fireEvent.press(getByLabelText('Add podcast'));

      await waitFor(() => {
        expect(RSSService.transformPodcastFromRSS).toHaveBeenCalledWith(
          'https://example.com/feed.xml',
        );
      });
    });
  });

  describe('Input Interaction', () => {
    it('should update URL when typing', () => {
      const { getByLabelText } = renderAddPodcastView();

      const input = getByLabelText('RSS feed URL input');
      fireEvent.changeText(input, 'https://test.com/rss');

      expect(input.props.value).toBe('https://test.com/rss');
    });

    it('should show clear button when URL has content', () => {
      const { getByLabelText } = renderAddPodcastView();

      const input = getByLabelText('RSS feed URL input');
      fireEvent.changeText(input, 'https://test.com/rss');

      expect(getByLabelText('Clear URL')).toBeTruthy();
    });

    it('should clear URL when clear button is pressed', () => {
      const { getByLabelText } = renderAddPodcastView();

      const input = getByLabelText('RSS feed URL input');
      fireEvent.changeText(input, 'https://test.com/rss');
      fireEvent.press(getByLabelText('Clear URL'));

      expect(input.props.value).toBe('');
    });

    it('should call onDismiss when Cancel is pressed', () => {
      const { getByText } = renderAddPodcastView();

      fireEvent.press(getByText('Cancel'));

      expect(mockOnDismiss).toHaveBeenCalled();
    });

    it('should call onGoToDiscover when Discover New Podcasts is pressed', () => {
      const { getByText } = renderAddPodcastView();

      fireEvent.press(getByText('Discover New Podcasts'));

      expect(mockOnGoToDiscover).toHaveBeenCalled();
    });
  });

  describe('Error State', () => {
    it('should show error for invalid URL', async () => {
      const { getByLabelText, getByText } = renderAddPodcastView();

      const input = getByLabelText('RSS feed URL input');
      fireEvent.changeText(input, 'not-a-url');
      fireEvent.press(getByLabelText('Add podcast'));

      await waitFor(() => {
        expect(getByText('Please enter a valid URL')).toBeTruthy();
      });
    });

    it('should show error when RSS fetch fails', async () => {
      (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Invalid RSS feed: missing channel element',
      });

      const { getByLabelText, getByText } = renderAddPodcastView();

      const input = getByLabelText('RSS feed URL input');
      fireEvent.changeText(input, 'https://example.com/bad-feed.xml');
      fireEvent.press(getByLabelText('Add podcast'));

      await waitFor(() => {
        expect(
          getByText('This URL does not appear to be a valid RSS feed'),
        ).toBeTruthy();
      });
    });

    it('should clear error when user starts typing again', async () => {
      const { getByLabelText, getByText, queryByText } = renderAddPodcastView();

      const input = getByLabelText('RSS feed URL input');
      fireEvent.changeText(input, 'not-a-url');
      fireEvent.press(getByLabelText('Add podcast'));

      await waitFor(() => {
        expect(getByText('Please enter a valid URL')).toBeTruthy();
      });

      fireEvent.changeText(input, 'https://');

      await waitFor(() => {
        expect(queryByText('Please enter a valid URL')).toBeNull();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when fetching', async () => {
      let resolvePromise: (value: unknown) => void;
      (RSSService.transformPodcastFromRSS as jest.Mock).mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
      );

      const { getByLabelText, getByText } = renderAddPodcastView();

      const input = getByLabelText('RSS feed URL input');
      fireEvent.changeText(input, 'https://example.com/feed.xml');
      fireEvent.press(getByLabelText('Add podcast'));

      await waitFor(() => {
        expect(getByText('Fetching podcast...')).toBeTruthy();
      });

      // Cleanup - resolve the promise
      resolvePromise!({ success: true, data: mockPodcast });
    });
  });

  describe('Preview State', () => {
    beforeEach(() => {
      (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
        success: true,
        data: mockPodcast,
      });
    });

    it('should show podcast preview after successful fetch', async () => {
      const { getByLabelText, getByText } = renderAddPodcastView();

      const input = getByLabelText('RSS feed URL input');
      fireEvent.changeText(input, 'https://example.com/feed.xml');
      fireEvent.press(getByLabelText('Add podcast'));

      await waitFor(() => {
        expect(getByText('Test Podcast')).toBeTruthy();
        expect(getByText('Test Author')).toBeTruthy();
      });
    });

    it('should display episode count in preview', async () => {
      const { getByLabelText, getByText } = renderAddPodcastView();

      const input = getByLabelText('RSS feed URL input');
      fireEvent.changeText(input, 'https://example.com/feed.xml');
      fireEvent.press(getByLabelText('Add podcast'));

      await waitFor(() => {
        expect(getByText('2 episodes')).toBeTruthy();
      });
    });

    it('should display description in preview', async () => {
      const { getByLabelText, getByText } = renderAddPodcastView();

      const input = getByLabelText('RSS feed URL input');
      fireEvent.changeText(input, 'https://example.com/feed.xml');
      fireEvent.press(getByLabelText('Add podcast'));

      await waitFor(() => {
        expect(
          getByText('A great test podcast about testing things.'),
        ).toBeTruthy();
      });
    });

    it('should display Subscribe button in preview', async () => {
      const { getByLabelText } = renderAddPodcastView();

      const input = getByLabelText('RSS feed URL input');
      fireEvent.changeText(input, 'https://example.com/feed.xml');
      fireEvent.press(getByLabelText('Add podcast'));

      await waitFor(() => {
        expect(getByLabelText('Subscribe')).toBeTruthy();
      });
    });

    it('should display Try a different URL button in preview', async () => {
      const { getByLabelText, getByText } = renderAddPodcastView();

      const input = getByLabelText('RSS feed URL input');
      fireEvent.changeText(input, 'https://example.com/feed.xml');
      fireEvent.press(getByLabelText('Add podcast'));

      await waitFor(() => {
        expect(getByText('Try a different URL')).toBeTruthy();
      });
    });

    it('should go back to input state when Try a different URL is pressed', async () => {
      const { getByLabelText, getByText, queryByText } = renderAddPodcastView();

      const input = getByLabelText('RSS feed URL input');
      fireEvent.changeText(input, 'https://example.com/feed.xml');
      fireEvent.press(getByLabelText('Add podcast'));

      await waitFor(() => {
        expect(getByText('Test Podcast')).toBeTruthy();
      });

      fireEvent.press(getByText('Try a different URL'));

      await waitFor(() => {
        expect(queryByText('Test Podcast')).toBeNull();
        expect(getByText('RSS Feed URL')).toBeTruthy();
      });
    });
  });

  describe('Subscribe Action', () => {
    beforeEach(() => {
      (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
        success: true,
        data: mockPodcast,
      });
    });

    it('should add podcast to store and dismiss when Subscribe is pressed', async () => {
      const addPodcastSpy = jest.fn();
      podcastStore.setState({
        podcasts: [],
        loading: false,
        error: null,
        addPodcast: addPodcastSpy,
      });

      const { getByLabelText } = renderAddPodcastView();

      const input = getByLabelText('RSS feed URL input');
      fireEvent.changeText(input, 'https://example.com/feed.xml');
      fireEvent.press(getByLabelText('Add podcast'));

      await waitFor(() => {
        expect(getByLabelText('Subscribe')).toBeTruthy();
      });

      fireEvent.press(getByLabelText('Subscribe'));

      await waitFor(() => {
        expect(addPodcastSpy).toHaveBeenCalledWith(mockPodcast);
        expect(mockOnDismiss).toHaveBeenCalled();
      });
    });

    it('should show Already Subscribed when podcast is already in library', async () => {
      podcastStore.setState({
        podcasts: [mockPodcast],
        loading: false,
        error: null,
      });

      const { getByLabelText, getByText } = renderAddPodcastView();

      const input = getByLabelText('RSS feed URL input');
      fireEvent.changeText(input, 'https://example.com/feed.xml');
      fireEvent.press(getByLabelText('Add podcast'));

      await waitFor(() => {
        expect(getByText('Already Subscribed')).toBeTruthy();
      });
    });

    it('should not call addPodcast when Subscribe is pressed for already subscribed podcast', async () => {
      const addPodcastSpy = jest.fn();
      podcastStore.setState({
        podcasts: [mockPodcast],
        loading: false,
        error: null,
        addPodcast: addPodcastSpy,
      });

      const { getByLabelText } = renderAddPodcastView();

      const input = getByLabelText('RSS feed URL input');
      fireEvent.changeText(input, 'https://example.com/feed.xml');
      fireEvent.press(getByLabelText('Add podcast'));

      await waitFor(() => {
        expect(getByLabelText('Already subscribed')).toBeTruthy();
      });

      fireEvent.press(getByLabelText('Already subscribed'));

      // Should not add podcast or dismiss when already subscribed
      expect(addPodcastSpy).not.toHaveBeenCalled();
      expect(mockOnDismiss).not.toHaveBeenCalled();
    });
  });

  describe('Podcast with No Episodes', () => {
    it('should display "No episodes" for podcast with empty episodes', async () => {
      const emptyPodcast = createMockPodcast({
        ...mockPodcast,
        episodes: [],
      });

      (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
        success: true,
        data: emptyPodcast,
      });

      const { getByLabelText, getAllByText } = renderAddPodcastView();

      const input = getByLabelText('RSS feed URL input');
      fireEvent.changeText(input, 'https://example.com/feed.xml');
      fireEvent.press(getByLabelText('Add podcast'));

      await waitFor(() => {
        // "No episodes" appears in both episode count and latest episode date
        expect(getAllByText('No episodes').length).toBeGreaterThanOrEqual(1);
      });
    });
  });
});
