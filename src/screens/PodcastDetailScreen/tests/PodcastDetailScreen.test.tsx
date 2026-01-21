import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { PodcastDetailScreen } from '../PodcastDetailScreen';
import { podcastStore, queueStore } from '../../../stores';
import {
  createMockPodcast,
  createMockEpisode,
  createMockQueueItem,
} from '../../../__mocks__';

jest.spyOn(Alert, 'alert');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
} as unknown as Parameters<typeof PodcastDetailScreen>[0]['navigation'];

const mockRoute = {
  key: 'podcast-detail-screen',
  name: 'PodcastDetail' as const,
  params: { podcastId: 'podcast-1' },
} as Parameters<typeof PodcastDetailScreen>[0]['route'];

describe('PodcastDetailScreen', () => {
  const mockPodcast = createMockPodcast({
    id: 'podcast-1',
    title: 'Test Podcast',
    episodes: [
      createMockEpisode({
        id: 'ep-1',
        podcastId: 'podcast-1',
        title: 'Episode 1',
      }),
    ],
  });

  beforeEach(() => {
    jest.clearAllMocks();
    podcastStore.setState({
      podcasts: [mockPodcast],
      loading: false,
      error: null,
    });
    queueStore.setState({
      queue: [],
      currentIndex: 0,
    });
  });

  const renderPodcastDetailScreen = (route = mockRoute) =>
    render(<PodcastDetailScreen navigation={mockNavigation} route={route} />);

  describe('Rendering', () => {
    it('should render PodcastDetailView with podcast data from route params', () => {
      const { getByText } = renderPodcastDetailScreen();

      expect(getByText('Test Podcast')).toBeTruthy();
    });

    it('should display episodes from the podcast', () => {
      const { getByText } = renderPodcastDetailScreen();

      expect(getByText('Episode 1')).toBeTruthy();
    });
  });

  describe('Navigation - Episode Press', () => {
    it('should navigate to EpisodeDetail when episode is pressed', () => {
      const { getByText } = renderPodcastDetailScreen();

      fireEvent.press(getByText('Episode 1'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('EpisodeDetail', {
        episodeId: 'ep-1',
        podcastId: 'podcast-1',
      });
    });
  });

  describe('Navigation - Unsubscribe', () => {
    it('should navigate back and remove podcast when unsubscribe is confirmed', async () => {
      const removePodcastSpy = jest.fn();
      podcastStore.setState({
        podcasts: [mockPodcast],
        loading: false,
        error: null,
        removePodcast: removePodcastSpy,
      });

      const { getByText } = renderPodcastDetailScreen();

      // Press the subscribed button to trigger unsubscribe
      fireEvent.press(getByText('Subscribed'));

      // Confirm the unsubscribe action
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const unsubscribeButton = alertCall[2].find(
        (btn: { text: string }) => btn.text === 'Unsubscribe',
      );
      unsubscribeButton.onPress();

      await waitFor(() => {
        expect(removePodcastSpy).toHaveBeenCalledWith('podcast-1');
        expect(mockNavigation.goBack).toHaveBeenCalled();
      });
    });

    it('should remove queue items for the podcast when unsubscribing', async () => {
      const removePodcastSpy = jest.fn();
      const removeFromQueueSpy = jest.fn();

      const queueItem = createMockQueueItem({
        id: 'q-1',
        episode: mockPodcast.episodes[0],
        podcast: mockPodcast,
      });

      podcastStore.setState({
        podcasts: [mockPodcast],
        loading: false,
        error: null,
        removePodcast: removePodcastSpy,
      });

      queueStore.setState({
        queue: [queueItem],
        currentIndex: 0,
        removeFromQueue: removeFromQueueSpy,
      });

      const { getByText } = renderPodcastDetailScreen();

      // Press the subscribed button to trigger unsubscribe
      fireEvent.press(getByText('Subscribed'));

      // Confirm the unsubscribe action
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const unsubscribeButton = alertCall[2].find(
        (btn: { text: string }) => btn.text === 'Unsubscribe',
      );
      unsubscribeButton.onPress();

      await waitFor(() => {
        expect(removeFromQueueSpy).toHaveBeenCalledWith('q-1');
        expect(removePodcastSpy).toHaveBeenCalledWith('podcast-1');
        expect(mockNavigation.goBack).toHaveBeenCalled();
      });
    });
  });

  describe('Different Podcast Data', () => {
    it('should render with different podcast from route params', () => {
      const differentPodcast = createMockPodcast({
        id: 'podcast-2',
        title: 'Different Podcast',
        author: 'Different Author',
        episodes: [
          createMockEpisode({
            id: 'ep-2',
            podcastId: 'podcast-2',
            title: 'Different Episode',
          }),
        ],
      });

      podcastStore.setState({
        podcasts: [mockPodcast, differentPodcast],
        loading: false,
        error: null,
      });

      const differentRoute = {
        ...mockRoute,
        params: { podcastId: 'podcast-2' },
      };

      const { getByText } = renderPodcastDetailScreen(differentRoute);

      expect(getByText('Different Podcast')).toBeTruthy();
      expect(getByText('Different Author')).toBeTruthy();
    });
  });
});
