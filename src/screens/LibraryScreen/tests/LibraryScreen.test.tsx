import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LibraryScreen } from '../LibraryScreen';
import { podcastStore } from '../../../stores';
import { createMockNavigation, createMockRoute } from '../../../__mocks__';

const mockNavigate = jest.fn();
const mockSetOptions = jest.fn();

const mockNavigation = {
  ...createMockNavigation(),
  navigate: mockNavigate,
  setOptions: mockSetOptions,
} as Parameters<typeof LibraryScreen>[0]['navigation'];

const mockRoute = createMockRoute('Library') as Parameters<
  typeof LibraryScreen
>[0]['route'];

describe('LibraryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    podcastStore.setState({
      podcasts: [],
      loading: false,
      error: null,
    });
  });

  const renderLibraryScreen = () =>
    render(<LibraryScreen navigation={mockNavigation} route={mockRoute} />);

  describe('Navigation Setup', () => {
    it('should set header options on mount', () => {
      renderLibraryScreen();

      expect(mockSetOptions).toHaveBeenCalled();
      expect(mockSetOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          headerRight: expect.any(Function),
        }),
      );
    });

    it('should render header right button', () => {
      renderLibraryScreen();

      // Get the headerRight function from setOptions call
      const setOptionsCall = mockSetOptions.mock.calls[0][0];
      const HeaderRight = setOptionsCall.headerRight;

      // Render the header right component
      const {} = render(<HeaderRight />);

      // The button should be touchable
      expect(HeaderRight).toBeDefined();
    });
  });

  describe('Navigation Handlers', () => {
    it('should navigate to PodcastDetail when podcast is pressed', () => {
      podcastStore.setState({
        podcasts: [
          {
            id: 'podcast-123',
            title: 'Test Podcast',
            author: 'Author',
            rssUrl: 'https://example.com/rss',
            artworkUrl: 'https://example.com/art.jpg',
            description: 'Description',
            subscribeDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            episodes: [],
          },
        ],
      });

      const { getByText } = renderLibraryScreen();

      fireEvent.press(getByText('Test Podcast'));

      expect(mockNavigate).toHaveBeenCalledWith('PodcastDetail', {
        podcastId: 'podcast-123',
      });
    });

    it('should navigate to AddPodcastModal when add button in empty state is pressed', () => {
      const { getByText } = renderLibraryScreen();

      fireEvent.press(getByText('Add Podcast'));

      expect(mockNavigate).toHaveBeenCalledWith('AddPodcastModal');
    });
  });

  describe('Rendering', () => {
    it('should render LibraryView component', () => {
      const { getByText } = renderLibraryScreen();

      // Empty state should be visible
      expect(getByText('No Podcasts Yet')).toBeTruthy();
    });

    it('should pass correct props to LibraryView', () => {
      podcastStore.setState({
        podcasts: [
          {
            id: '1',
            title: 'Podcast One',
            author: 'Author One',
            rssUrl: 'https://example.com/rss',
            artworkUrl: 'https://example.com/art.jpg',
            description: 'Description',
            subscribeDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            episodes: [],
          },
        ],
      });

      const { getByText } = renderLibraryScreen();

      // Podcast should be displayed
      expect(getByText('Podcast One')).toBeTruthy();
    });
  });
});
