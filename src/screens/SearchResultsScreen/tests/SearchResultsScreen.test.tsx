import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SearchResultsScreen } from '../SearchResultsScreen';
import { podcastStore } from '../../../stores';
import { DiscoveryService } from '../../../services';
import {
  createMockDiscoveryPodcasts,
  createMockNavigation,
  createMockRoute,
} from '../../../__mocks__';

// Mock the DiscoveryService
jest.mock('../../../services', () => ({
  DiscoveryService: {
    searchPodcasts: jest.fn(),
  },
  RSSService: {
    transformPodcastFromRSS: jest.fn(),
  },
}));

const mockNavigation = createMockNavigation() as unknown as Parameters<
  typeof SearchResultsScreen
>[0]['navigation'];

const mockRoute = createMockRoute('SearchResults', {
  query: 'test podcast',
}) as Parameters<typeof SearchResultsScreen>[0]['route'];

describe('SearchResultsScreen', () => {
  const mockResults = createMockDiscoveryPodcasts(3);

  beforeEach(() => {
    jest.clearAllMocks();
    podcastStore.setState({
      podcasts: [],
      loading: false,
      error: null,
    });
    (DiscoveryService.searchPodcasts as jest.Mock).mockResolvedValue({
      success: true,
      data: mockResults,
    });
  });

  const renderSearchResultsScreen = (route = mockRoute) =>
    render(<SearchResultsScreen navigation={mockNavigation} route={route} />);

  describe('Rendering', () => {
    it('should render SearchResultsView with query from route params', async () => {
      const { findByText } = renderSearchResultsScreen();

      // Format is "N results for 'query'"
      expect(await findByText(/results for "test podcast"/)).toBeTruthy();
    });

    it('should display search results', async () => {
      const { findByText } = renderSearchResultsScreen();

      expect(await findByText('Discovery Podcast 1')).toBeTruthy();
      expect(await findByText('Discovery Podcast 2')).toBeTruthy();
    });
  });

  describe('Navigation - Podcast Press', () => {
    it('should navigate to PodcastPreview when a podcast is pressed', async () => {
      const { findByText } = renderSearchResultsScreen();

      await waitFor(async () => {
        const podcastCard = await findByText('Discovery Podcast 1');
        fireEvent.press(podcastCard);
      });

      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith(
          'PodcastPreview',
          expect.objectContaining({
            podcast: expect.objectContaining({
              title: 'Discovery Podcast 1',
            }),
          }),
        );
      });
    });
  });

  describe('Loading State', () => {
    it('should display loading state while searching', async () => {
      // Make the search take a long time
      (DiscoveryService.searchPodcasts as jest.Mock).mockImplementation(
        () => new Promise(() => {}),
      );

      const { getByText } = renderSearchResultsScreen();

      expect(getByText('Searching...')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('should display error state when search fails', async () => {
      (DiscoveryService.searchPodcasts as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Network error',
      });

      const { findByText } = renderSearchResultsScreen();

      expect(await findByText('Network error')).toBeTruthy();
    });
  });

  describe('No Results State', () => {
    it('should display no results state when search returns empty', async () => {
      (DiscoveryService.searchPodcasts as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      const { findByText } = renderSearchResultsScreen();

      // Text is "No Results" and "No podcasts found matching..."
      expect(await findByText('No Results')).toBeTruthy();
    });
  });

  describe('Different Query', () => {
    it('should search with different query from route params', async () => {
      const differentRoute = {
        ...mockRoute,
        params: { query: 'comedy shows' },
      };

      const { findByText } = renderSearchResultsScreen(differentRoute);

      await waitFor(() => {
        expect(DiscoveryService.searchPodcasts).toHaveBeenCalledWith({
          query: 'comedy shows',
          limit: 25,
        });
      });

      // Format is "N results for 'query'"
      expect(await findByText(/results for "comedy shows"/)).toBeTruthy();
    });
  });
});
