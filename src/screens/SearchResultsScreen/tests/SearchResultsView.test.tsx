import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { SearchResultsView } from '../SearchResultsView';
import { podcastStore } from '../../../stores';
import { DiscoveryService, RSSService } from '../../../services';
import {
  createMockDiscoveryPodcasts,
  createMockDiscoveryPodcast,
  createMockPodcast,
} from '../../../__mocks__';

// Mock the services
jest.mock('../../../services', () => ({
  DiscoveryService: {
    searchPodcasts: jest.fn(),
  },
  RSSService: {
    transformPodcastFromRSS: jest.fn(),
  },
}));

jest.spyOn(Alert, 'alert');

describe('SearchResultsView', () => {
  const mockOnPodcastPress = jest.fn();
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
    (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
      success: true,
      data: createMockPodcast(),
    });
  });

  const renderSearchResultsView = (query = 'test podcast') =>
    render(
      <SearchResultsView query={query} onPodcastPress={mockOnPodcastPress} />,
    );

  describe('Loading State', () => {
    it('should display loading state while searching', () => {
      (DiscoveryService.searchPodcasts as jest.Mock).mockImplementation(
        () => new Promise(() => {}),
      );

      const { getByText } = renderSearchResultsView();

      expect(getByText('Searching...')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('should display error message when search fails', async () => {
      (DiscoveryService.searchPodcasts as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Failed to connect to server',
      });

      const { findByText } = renderSearchResultsView();

      expect(await findByText('Failed to connect to server')).toBeTruthy();
    });

    it('should display Try Again button on error', async () => {
      (DiscoveryService.searchPodcasts as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Network error',
      });

      const { findByText } = renderSearchResultsView();

      expect(await findByText('Try Again')).toBeTruthy();
    });

    it('should retry search when Try Again is pressed', async () => {
      (DiscoveryService.searchPodcasts as jest.Mock)
        .mockResolvedValueOnce({
          success: false,
          error: 'Network error',
        })
        .mockResolvedValueOnce({
          success: true,
          data: mockResults,
        });

      const { findByText } = renderSearchResultsView();

      const retryButton = await findByText('Try Again');
      fireEvent.press(retryButton);

      await waitFor(() => {
        expect(DiscoveryService.searchPodcasts).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('No Results State', () => {
    it('should display no results message when search returns empty', async () => {
      (DiscoveryService.searchPodcasts as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      const { findByText } = renderSearchResultsView();

      // Text is "No Results" and "No podcasts found matching..."
      expect(await findByText('No Results')).toBeTruthy();
    });
  });

  describe('Results Header', () => {
    it('should display results header with query', async () => {
      const { findByText } = renderSearchResultsView();

      // Format is "N results for 'query'"
      expect(await findByText(/results for "test podcast"/)).toBeTruthy();
    });

    it('should display results count', async () => {
      const { findByText } = renderSearchResultsView();

      // 3 results from mockResults - format is "3 results for..."
      expect(await findByText(/3 results/)).toBeTruthy();
    });
  });

  describe('Podcast Cards', () => {
    it('should display podcast titles', async () => {
      const { findByText } = renderSearchResultsView();

      await waitFor(async () => {
        expect(await findByText('Discovery Podcast 1')).toBeTruthy();
        expect(await findByText('Discovery Podcast 2')).toBeTruthy();
        expect(await findByText('Discovery Podcast 3')).toBeTruthy();
      });
    });

    it('should call onPodcastPress when podcast card is pressed', async () => {
      const { findByText } = renderSearchResultsView();

      const podcastCard = await findByText('Discovery Podcast 1');
      fireEvent.press(podcastCard);

      expect(mockOnPodcastPress).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Discovery Podcast 1',
        }),
      );
    });

    it('should show subscribe icon for unsubscribed podcasts', async () => {
      const { findAllByText } = renderSearchResultsView();

      // The subscribe button uses an "add" icon
      const subscribeIcons = await findAllByText('add');

      expect(subscribeIcons.length).toBeGreaterThan(0);
    });

    it('should show checkmark icon for subscribed podcasts', async () => {
      const subscribedPodcast = createMockPodcast({
        rssUrl: 'https://example.com/feed1.xml',
      });

      podcastStore.setState({
        podcasts: [subscribedPodcast],
        loading: false,
        error: null,
      });

      const { findByText } = renderSearchResultsView();

      // The subscribed state shows a checkmark icon
      expect(await findByText('checkmark')).toBeTruthy();
    });
  });

  describe('Subscribe Functionality', () => {
    it('should subscribe to podcast when subscribe icon is pressed', async () => {
      const addPodcastSpy = jest.fn();
      podcastStore.setState({
        podcasts: [],
        loading: false,
        error: null,
        addPodcast: addPodcastSpy,
      });

      const singleResult = [
        createMockDiscoveryPodcast({
          id: 'single-1',
          title: 'Single Podcast',
          feedUrl: 'https://example.com/single-feed.xml',
        }),
      ];

      (DiscoveryService.searchPodcasts as jest.Mock).mockResolvedValue({
        success: true,
        data: singleResult,
      });

      const { findByText } = renderSearchResultsView();

      // The subscribe button uses an "add" icon
      const subscribeButton = await findByText('add');
      fireEvent.press(subscribeButton);

      await waitFor(() => {
        expect(RSSService.transformPodcastFromRSS).toHaveBeenCalledWith(
          'https://example.com/single-feed.xml',
        );
        expect(addPodcastSpy).toHaveBeenCalled();
      });
    });

    it('should show alert when subscription fails', async () => {
      (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Failed to fetch RSS feed',
      });

      const singleResult = [
        createMockDiscoveryPodcast({
          id: 'fail-1',
          title: 'Fail Podcast',
        }),
      ];

      (DiscoveryService.searchPodcasts as jest.Mock).mockResolvedValue({
        success: true,
        data: singleResult,
      });

      const { findByText } = renderSearchResultsView();

      // The subscribe button uses an "add" icon
      const subscribeButton = await findByText('add');
      fireEvent.press(subscribeButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Subscription Failed',
          expect.any(String),
        );
      });
    });
  });

  describe('Different Query', () => {
    it('should search with provided query', async () => {
      renderSearchResultsView('comedy podcasts');

      await waitFor(() => {
        expect(DiscoveryService.searchPodcasts).toHaveBeenCalledWith({
          query: 'comedy podcasts',
          limit: 25,
        });
      });
    });

    it('should not search with empty query', async () => {
      (DiscoveryService.searchPodcasts as jest.Mock).mockClear();

      renderSearchResultsView('   ');

      await waitFor(() => {
        expect(DiscoveryService.searchPodcasts).not.toHaveBeenCalled();
      });
    });
  });
});
