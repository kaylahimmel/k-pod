import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { DiscoverView } from '../DiscoverView';
import { podcastStore } from '../../../stores';
import { DiscoveryService, RSSService } from '../../../services';
import {
  createMockDiscoveryPodcast,
  createMockPodcast,
  createMockEpisode,
} from '../../../__mocks__';

// Mock services
jest.mock('../../../services', () => ({
  DiscoveryService: {
    searchPodcasts: jest.fn(),
    getTrendingPodcasts: jest.fn(),
  },
  RSSService: {
    transformPodcastFromRSS: jest.fn(),
  },
}));

describe('DiscoverView', () => {
  const mockOnPodcastPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    podcastStore.setState({
      podcasts: [],
      loading: false,
      error: null,
    });

    // Default mock for getTrendingPodcasts
    (DiscoveryService.getTrendingPodcasts as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        createMockDiscoveryPodcast({
          id: '1',
          title: 'Trending Podcast 1',
          feedUrl: 'https://example.com/feed1.xml',
        }),
        createMockDiscoveryPodcast({
          id: '2',
          title: 'Trending Podcast 2',
          feedUrl: 'https://example.com/feed2.xml',
        }),
      ],
    });

    // Default mock for searchPodcasts
    (DiscoveryService.searchPodcasts as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });

    // Default mock for RSSService - returns podcast with episodes
    (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
      success: true,
      data: createMockPodcast({
        id: '1',
        title: 'Mock Podcast',
        episodes: [
          createMockEpisode({
            id: 'ep1',
            podcastId: '1',
            title: 'Episode 1',
          }),
        ],
      }),
    });
  });

  const renderDiscoverView = () =>
    render(<DiscoverView onPodcastPress={mockOnPodcastPress} />);

  describe('Initial State', () => {
    it('should display search bar', async () => {
      const { getByPlaceholderText } = renderDiscoverView();

      await waitFor(() => {
        expect(getByPlaceholderText('Search podcasts...')).toBeTruthy();
      });
    });

    it('should load trending podcasts on mount', async () => {
      renderDiscoverView();

      await waitFor(() => {
        expect(DiscoveryService.getTrendingPodcasts).toHaveBeenCalledWith(
          'ALL',
          20,
        );
      });
    });

    it('should display trending podcasts after loading', async () => {
      const { getByText } = renderDiscoverView();

      await waitFor(() => {
        expect(getByText('Trending Podcast 1')).toBeTruthy();
        expect(getByText('Trending Podcast 2')).toBeTruthy();
      });
    });
  });

  describe('Search', () => {
    it('should search when user submits query', async () => {
      (DiscoveryService.searchPodcasts as jest.Mock).mockResolvedValue({
        success: true,
        data: [
          createMockDiscoveryPodcast({ id: 's1', title: 'Search Result 1' }),
        ],
      });

      const { getByPlaceholderText, getByText } = renderDiscoverView();

      await waitFor(() => {
        expect(getByPlaceholderText('Search podcasts...')).toBeTruthy();
      });

      const searchInput = getByPlaceholderText('Search podcasts...');
      fireEvent.changeText(searchInput, 'test query');
      fireEvent(searchInput, 'submitEditing');

      await waitFor(() => {
        expect(DiscoveryService.searchPodcasts).toHaveBeenCalledWith({
          query: 'test query',
        });
        expect(getByText('Search Result 1')).toBeTruthy();
      });
    });

    it('should display no results message when search returns empty', async () => {
      (DiscoveryService.searchPodcasts as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      const { getByPlaceholderText, getByText } = renderDiscoverView();

      await waitFor(() => {
        expect(getByPlaceholderText('Search podcasts...')).toBeTruthy();
      });

      const searchInput = getByPlaceholderText('Search podcasts...');
      fireEvent.changeText(searchInput, 'nonexistent');
      fireEvent(searchInput, 'submitEditing');

      await waitFor(() => {
        expect(getByText('No Results')).toBeTruthy();
      });
    });

    it('should display error state on search failure', async () => {
      (DiscoveryService.searchPodcasts as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Network error',
      });

      const { getByPlaceholderText, getByText } = renderDiscoverView();

      await waitFor(() => {
        expect(getByPlaceholderText('Search podcasts...')).toBeTruthy();
      });

      const searchInput = getByPlaceholderText('Search podcasts...');
      fireEvent.changeText(searchInput, 'test');
      fireEvent(searchInput, 'submitEditing');

      await waitFor(() => {
        expect(getByText('Something went wrong')).toBeTruthy();
        expect(getByText('Network error')).toBeTruthy();
      });
    });
  });

  describe('Podcast Card', () => {
    it('should call onPodcastPress when podcast card is pressed', async () => {
      const { getByText } = renderDiscoverView();

      await waitFor(() => {
        expect(getByText('Trending Podcast 1')).toBeTruthy();
      });

      fireEvent.press(getByText('Trending Podcast 1'));

      expect(mockOnPodcastPress).toHaveBeenCalled();
    });

    it('should not have added any podcasts to store before user interaction', async () => {
      const { getByText } = renderDiscoverView();

      await waitFor(() => {
        expect(getByText('Trending Podcast 1')).toBeTruthy();
      });

      // Verify no podcasts have been added to the store yet (no user interaction)
      expect(podcastStore.getState().podcasts).toHaveLength(0);
    });

    it('should filter out already subscribed podcasts from trending', async () => {
      // When a user is subscribed to a podcast, it should be filtered out from trending
      podcastStore.setState({
        podcasts: [
          {
            id: '1',
            title: 'Trending Podcast 1',
            author: 'Test Author',
            rssUrl: 'https://example.com/feed1.xml', // Matches trending podcast 1's feedUrl
            artworkUrl: 'https://example.com/artwork.jpg',
            description: '',
            subscribeDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            episodes: [],
          },
        ],
        loading: false,
        error: null,
      });

      const { queryByText, getByText } = renderDiscoverView();

      await waitFor(() => {
        // Trending Podcast 1 should be filtered out since user is subscribed
        expect(queryByText('Trending Podcast 1')).toBeNull();
        // Trending Podcast 2 should still show (different feed URL)
        expect(getByText('Trending Podcast 2')).toBeTruthy();
      });
    });
  });

  describe('Loading State', () => {
    it('should display loading state while fetching trending', async () => {
      // Make getTrendingPodcasts hang
      (DiscoveryService.getTrendingPodcasts as jest.Mock).mockImplementation(
        () => new Promise(() => {}),
      );

      const { getByText } = renderDiscoverView();

      expect(getByText('Searching...')).toBeTruthy();
    });
  });
});
