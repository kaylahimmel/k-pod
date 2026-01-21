import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PodcastPreviewView } from '../PodcastPreviewView';
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

describe('PodcastPreviewView', () => {
  const mockOnSubscribe = jest.fn();

  const mockRSSPodcast = createMockPodcast({
    id: 'rss-1',
    episodes: [
      {
        id: 'ep-1',
        podcastId: 'rss-1',
        title: 'Episode 1 - Getting Started',
        description: 'The first episode of the podcast',
        audioUrl: 'https://example.com/ep1.mp3',
        duration: 3600,
        publishDate: '2024-06-15T00:00:00Z',
        played: false,
      },
      {
        id: 'ep-2',
        podcastId: 'rss-1',
        title: 'Episode 2 - Deep Dive',
        description: 'A deeper look into the topic',
        audioUrl: 'https://example.com/ep2.mp3',
        duration: 2400,
        publishDate: '2024-06-10T00:00:00Z',
        played: false,
      },
    ],
  });

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

  const renderPodcastPreviewView = (podcast = MOCK_PREVIEW_DISCOVERY_PODCAST) =>
    render(
      <PodcastPreviewView podcast={podcast} onSubscribe={mockOnSubscribe} />,
    );

  describe('Header Section', () => {
    it('should display podcast title', async () => {
      const { findByText } = renderPodcastPreviewView();

      expect(await findByText('Preview Test Podcast')).toBeTruthy();
    });

    it('should display podcast author', async () => {
      const { findByText } = renderPodcastPreviewView();

      expect(await findByText('Preview Test Author')).toBeTruthy();
    });

    it('should display podcast genre', async () => {
      const { findByText } = renderPodcastPreviewView();

      expect(await findByText('Technology')).toBeTruthy();
    });

    it('should display episode count', async () => {
      const { findByText } = renderPodcastPreviewView();

      expect(await findByText('50 episodes')).toBeTruthy();
    });
  });

  describe('Subscribe Button', () => {
    it('should display Subscribe button when not subscribed', async () => {
      const { findByText } = renderPodcastPreviewView();

      expect(await findByText('Subscribe')).toBeTruthy();
    });

    it('should display Subscribed button when already subscribed', async () => {
      // Create a podcast with the same feedUrl as MOCK_PREVIEW_DISCOVERY_PODCAST
      const subscribedPodcast = createMockPodcast({
        rssUrl: MOCK_PREVIEW_DISCOVERY_PODCAST.feedUrl,
      });
      podcastStore.setState({
        podcasts: [subscribedPodcast],
        loading: false,
        error: null,
      });

      const { findByText } = renderPodcastPreviewView();

      expect(await findByText('Subscribed')).toBeTruthy();
    });

    it('should call handleSubscribe when Subscribe button is pressed', async () => {
      const { findByText } = renderPodcastPreviewView();

      const subscribeButton = await findByText('Subscribe');
      fireEvent.press(subscribeButton);

      await waitFor(() => {
        expect(RSSService.transformPodcastFromRSS).toHaveBeenCalledWith(
          MOCK_PREVIEW_DISCOVERY_PODCAST.feedUrl,
        );
      });
    });

    it('should be disabled when already subscribed', async () => {
      const subscribedPodcast = createMockPodcast({
        rssUrl: MOCK_PREVIEW_DISCOVERY_PODCAST.feedUrl,
      });
      podcastStore.setState({
        podcasts: [subscribedPodcast],
        loading: false,
        error: null,
      });

      const { findByText } = renderPodcastPreviewView();

      const subscribedButton = await findByText('Subscribed');
      fireEvent.press(subscribedButton);

      // Should not make additional calls since it's already subscribed
      // transformPodcastFromRSS is called once for episode fetch on mount
      expect(RSSService.transformPodcastFromRSS).toHaveBeenCalledTimes(1);
    });
  });

  describe('Description Section', () => {
    it('should display About section with description', async () => {
      const { findByText } = renderPodcastPreviewView();

      expect(await findByText('About')).toBeTruthy();
    });

    it('should display Show more button for long descriptions', async () => {
      const longDescriptionPodcast = createMockDiscoveryPodcast({
        description:
          'This is a very long description that exceeds 200 characters. '.repeat(
            5,
          ),
      });

      const { findByText } = renderPodcastPreviewView(longDescriptionPodcast);

      expect(await findByText('Show more')).toBeTruthy();
    });

    it('should toggle description when Show more/less is pressed', async () => {
      const longDescriptionPodcast = createMockDiscoveryPodcast({
        description:
          'This is a very long description that exceeds 200 characters. '.repeat(
            5,
          ),
      });

      const { findByText } = renderPodcastPreviewView(longDescriptionPodcast);

      const showMoreButton = await findByText('Show more');
      fireEvent.press(showMoreButton);

      expect(await findByText('Show less')).toBeTruthy();
    });
  });

  describe('Episodes Section', () => {
    it('should display Recent Episodes header', async () => {
      const { findByText } = renderPodcastPreviewView();

      expect(await findByText('Recent Episodes')).toBeTruthy();
    });

    it('should display loading state while fetching episodes', () => {
      (RSSService.transformPodcastFromRSS as jest.Mock).mockImplementation(
        () => new Promise(() => {}), // Never resolves to keep loading
      );

      const { getByText } = renderPodcastPreviewView();

      expect(getByText('Loading episodes...')).toBeTruthy();
    });

    it('should display episodes after loading', async () => {
      const { findByText } = renderPodcastPreviewView();

      await waitFor(async () => {
        expect(await findByText('Episode 1 - Getting Started')).toBeTruthy();
        expect(await findByText('Episode 2 - Deep Dive')).toBeTruthy();
      });
    });

    it('should display error state when episode fetch fails', async () => {
      (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Failed to load episodes',
      });

      const { findByText } = renderPodcastPreviewView();

      expect(await findByText('Failed to load episodes')).toBeTruthy();
    });

    it('should display empty state when no episodes', async () => {
      (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
        success: true,
        data: { ...mockRSSPodcast, episodes: [] },
      });

      const { findByText } = renderPodcastPreviewView();

      expect(await findByText('No Episodes')).toBeTruthy();
      expect(
        await findByText('No episodes available for this podcast'),
      ).toBeTruthy();
    });

    it('should retry fetching episodes when retry button is pressed', async () => {
      (RSSService.transformPodcastFromRSS as jest.Mock)
        .mockResolvedValueOnce({
          success: false,
          error: 'Network error',
        })
        .mockResolvedValueOnce({
          success: true,
          data: mockRSSPodcast,
        });

      const { findByText } = renderPodcastPreviewView();

      // Wait for error state
      const retryButton = await findByText('Try Again');
      fireEvent.press(retryButton);

      // After retry, episodes should load
      await waitFor(async () => {
        expect(await findByText('Episode 1 - Getting Started')).toBeTruthy();
      });
    });
  });

  describe('Episode Card', () => {
    it('should display episode title', async () => {
      const { findByText } = renderPodcastPreviewView();

      expect(await findByText('Episode 1 - Getting Started')).toBeTruthy();
    });

    it('should display episode description', async () => {
      const { findByText } = renderPodcastPreviewView();

      expect(await findByText('The first episode of the podcast')).toBeTruthy();
    });

    it('should display formatted duration', async () => {
      const { findByText } = renderPodcastPreviewView();

      // 3600 seconds = 1:00:00
      expect(await findByText('1:00:00')).toBeTruthy();
    });
  });
});
