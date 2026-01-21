import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PodcastPreviewScreen } from '../PodcastPreviewScreen';
import { RSSService } from '../../../services';
import { podcastStore } from '../../../stores';
import {
  createMockDiscoveryPodcast,
  createMockPodcast,
  MOCK_PREVIEW_DISCOVERY_PODCAST,
} from '../../../__mocks__';

// Mock the services
jest.mock('../../../services', () => ({
  RSSService: {
    transformPodcastFromRSS: jest.fn(),
  },
}));

const mockRSSPodcast = createMockPodcast({
  id: 'rss-1',
  episodes: [
    {
      id: 'ep-1',
      podcastId: 'rss-1',
      title: 'Episode 1',
      description: 'First episode',
      audioUrl: 'https://example.com/ep1.mp3',
      duration: 3600,
      publishDate: '2024-06-15T00:00:00Z',
      played: false,
    },
  ],
});

const mockNavigation = {
  navigate: jest.fn(),
  setOptions: jest.fn(),
  goBack: jest.fn(),
} as unknown as Parameters<typeof PodcastPreviewScreen>[0]['navigation'];

const mockRoute = {
  key: 'podcast-preview-screen',
  name: 'PodcastPreview' as const,
  params: { podcast: MOCK_PREVIEW_DISCOVERY_PODCAST },
} as Parameters<typeof PodcastPreviewScreen>[0]['route'];

describe('PodcastPreviewScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    podcastStore.setState({
      podcasts: [],
      loading: false,
      error: null,
    });
    (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
      success: true,
      data: mockRSSPodcast,
    });
  });

  const renderPodcastPreviewScreen = (route = mockRoute) =>
    render(<PodcastPreviewScreen navigation={mockNavigation} route={route} />);

  describe('Rendering', () => {
    it('should render PodcastPreviewView with podcast data from route params', async () => {
      const { findByText } = renderPodcastPreviewScreen();

      expect(await findByText('Preview Test Podcast')).toBeTruthy();
      expect(await findByText('Preview Test Author')).toBeTruthy();
    });

    it('should display podcast genre and episode count', async () => {
      const { findByText } = renderPodcastPreviewScreen();

      expect(await findByText('Technology')).toBeTruthy();
      expect(await findByText('50 episodes')).toBeTruthy();
    });

    it('should display description section', async () => {
      const { findByText } = renderPodcastPreviewScreen();

      expect(await findByText('About')).toBeTruthy();
    });

    it('should display episodes section', async () => {
      const { findByText } = renderPodcastPreviewScreen();

      expect(await findByText('Recent Episodes')).toBeTruthy();
    });

    it('should load and display episodes', async () => {
      const { findByText } = renderPodcastPreviewScreen();

      await waitFor(async () => {
        expect(await findByText('Episode 1')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back after successful subscription', async () => {
      const { findByText } = renderPodcastPreviewScreen();

      const subscribeButton = await findByText('Subscribe');
      fireEvent.press(subscribeButton);

      await waitFor(() => {
        expect(mockNavigation.goBack).toHaveBeenCalled();
      });
    });

    it('should not navigate back if subscription fails', async () => {
      (RSSService.transformPodcastFromRSS as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          data: mockRSSPodcast,
        })
        .mockResolvedValueOnce({
          success: false,
          error: 'Subscription failed',
        });

      const { findByText } = renderPodcastPreviewScreen();

      const subscribeButton = await findByText('Subscribe');
      fireEvent.press(subscribeButton);

      await waitFor(() => {
        expect(mockNavigation.goBack).not.toHaveBeenCalled();
      });
    });
  });

  describe('Subscribe Functionality', () => {
    it('should show Subscribe button when not subscribed', async () => {
      const { findByText } = renderPodcastPreviewScreen();

      expect(await findByText('Subscribe')).toBeTruthy();
    });

    it('should show Subscribed button when already subscribed', async () => {
      const subscribedPodcast = createMockPodcast({
        rssUrl: MOCK_PREVIEW_DISCOVERY_PODCAST.feedUrl,
      });
      podcastStore.setState({
        podcasts: [subscribedPodcast],
        loading: false,
        error: null,
      });

      const { findByText } = renderPodcastPreviewScreen();

      expect(await findByText('Subscribed')).toBeTruthy();
    });

    it('should add podcast to store when subscribing', async () => {
      const addPodcastSpy = jest.fn();
      podcastStore.setState({
        podcasts: [],
        loading: false,
        error: null,
        addPodcast: addPodcastSpy,
      });

      const { findByText } = renderPodcastPreviewScreen();

      const subscribeButton = await findByText('Subscribe');
      fireEvent.press(subscribeButton);

      await waitFor(() => {
        expect(addPodcastSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Different Podcast Data', () => {
    it('should render with different podcast from route params', async () => {
      const differentPodcast = createMockDiscoveryPodcast({
        id: 'different-1',
        title: 'Different Podcast',
        author: 'Different Author',
        genre: 'Comedy',
        episodeCount: 100,
      });

      const differentRoute = {
        ...mockRoute,
        params: { podcast: differentPodcast },
      };

      const { findByText } = renderPodcastPreviewScreen(differentRoute);

      expect(await findByText('Different Podcast')).toBeTruthy();
      expect(await findByText('Different Author')).toBeTruthy();
      expect(await findByText('Comedy')).toBeTruthy();
      expect(await findByText('100 episodes')).toBeTruthy();
    });
  });
});
