import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { PodcastDetailView } from '../PodcastDetailView';
import { podcastStore, queueStore } from '../../../stores';
import { createMockEpisode, createMockPodcast } from '../../../__mocks__';

jest.spyOn(Alert, 'alert');

describe('PodcastDetailView', () => {
  const mockOnEpisodePress = jest.fn();
  const mockOnPlayEpisode = jest.fn();
  const mockOnUnsubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    podcastStore.setState({
      podcasts: [],
      loading: false,
      error: null,
    });
    queueStore.setState({
      queue: [],
      currentIndex: 0,
    });
  });

  const renderPodcastDetailView = (podcastId = 'podcast-1') =>
    render(
      <PodcastDetailView
        podcastId={podcastId}
        onEpisodePress={mockOnEpisodePress}
        onPlayEpisode={mockOnPlayEpisode}
        onUnsubscribe={mockOnUnsubscribe}
      />,
    );

  describe('Not Found State', () => {
    it("should display not found when podcast doesn't exist", () => {
      const { getByText } = renderPodcastDetailView('nonexistent');

      expect(getByText('Podcast Not Found')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should display loading state when loading with no podcast', () => {
      podcastStore.setState({ loading: true, podcasts: [] });

      const { getByText } = renderPodcastDetailView();

      expect(getByText('Loading podcast...')).toBeTruthy();
    });
  });

  describe('Podcast Header', () => {
    it('should display podcast title and author', () => {
      const podcast = createMockPodcast({
        title: 'My Amazing Podcast',
        author: 'John Doe',
      });
      podcastStore.setState({ podcasts: [podcast] });

      const { getByText } = renderPodcastDetailView();

      expect(getByText('My Amazing Podcast')).toBeTruthy();
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should display episode count', () => {
      const podcast = createMockPodcast({
        episodes: [createMockEpisode(), createMockEpisode({ id: 'ep-2' })],
      });
      podcastStore.setState({ podcasts: [podcast] });

      const { getByText } = renderPodcastDetailView();

      expect(getByText('2 episodes')).toBeTruthy();
    });

    it('should display subscribed button', () => {
      podcastStore.setState({ podcasts: [createMockPodcast()] });

      const { getByText } = renderPodcastDetailView();

      expect(getByText('Subscribed')).toBeTruthy();
    });
  });

  describe('Episode List', () => {
    it('should display episodes section header', () => {
      podcastStore.setState({ podcasts: [createMockPodcast()] });

      const { getByText } = renderPodcastDetailView();

      expect(getByText('Episodes')).toBeTruthy();
    });

    it('should display episode titles', () => {
      const podcast = createMockPodcast({
        episodes: [
          createMockEpisode({ id: '1', title: 'Episode One' }),
          createMockEpisode({ id: '2', title: 'Episode Two' }),
        ],
      });
      podcastStore.setState({ podcasts: [podcast] });

      const { getByText } = renderPodcastDetailView();

      expect(getByText('Episode One')).toBeTruthy();
      expect(getByText('Episode Two')).toBeTruthy();
    });

    it('should display empty state when no episodes', () => {
      podcastStore.setState({
        podcasts: [createMockPodcast({ episodes: [] })],
      });

      const { getByText } = renderPodcastDetailView();

      expect(getByText('No Episodes')).toBeTruthy();
    });

    it('should call onEpisodePress when episode card is pressed', () => {
      const podcast = createMockPodcast({
        episodes: [createMockEpisode({ id: 'ep-123', title: 'Test Episode' })],
      });
      podcastStore.setState({ podcasts: [podcast] });

      const { getByText } = renderPodcastDetailView();

      fireEvent.press(getByText('Test Episode'));

      expect(mockOnEpisodePress).toHaveBeenCalledWith('ep-123');
    });
  });

  describe('Unsubscribe', () => {
    it('should show confirmation alert when unsubscribe is pressed', () => {
      podcastStore.setState({
        podcasts: [createMockPodcast({ title: 'My Podcast' })],
      });

      const { getByText } = renderPodcastDetailView();

      fireEvent.press(getByText('Subscribed'));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Unsubscribe',
        'Are you sure you want to unsubscribe from "My Podcast"?',
        expect.any(Array),
      );
    });
  });

  describe('Add to Queue', () => {
    it('should show disabled queue icon when episode is already in queue', async () => {
      const episode = createMockEpisode({ id: 'ep-1' });
      const podcast = createMockPodcast({ episodes: [episode] });

      podcastStore.setState({ podcasts: [podcast] });
      queueStore.setState({
        queue: [{ id: 'q-1', episode, podcast, position: 0 }],
      });

      const { getAllByText, queryAllByText } = renderPodcastDetailView();

      // Should show 'checkmark-circle' icon instead of 'add-circle'
      expect(getAllByText('checkmark-circle').length).toBeGreaterThanOrEqual(1);
      expect(queryAllByText('add-circle')).toHaveLength(0);

      // Pressing the disabled button should not trigger any alerts
      const checkmarkIcons = getAllByText('checkmark-circle');
      fireEvent.press(checkmarkIcons[checkmarkIcons.length - 1]);

      await waitFor(() => {
        expect(Alert.alert).not.toHaveBeenCalled();
      });
    });
  });
});
