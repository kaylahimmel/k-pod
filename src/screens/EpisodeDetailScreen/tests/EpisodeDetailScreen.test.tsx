import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { EpisodeDetailScreen } from '../EpisodeDetailScreen';
import { podcastStore, queueStore } from '../../../stores';
import { createMockPodcast, createMockEpisode } from '../../../__mocks__';

jest.spyOn(Alert, 'alert');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
} as unknown as Parameters<typeof EpisodeDetailScreen>[0]['navigation'];

const mockRoute = {
  key: 'episode-detail-screen',
  name: 'EpisodeDetail' as const,
  params: { episodeId: 'ep-1', podcastId: 'podcast-1' },
} as Parameters<typeof EpisodeDetailScreen>[0]['route'];

describe('EpisodeDetailScreen', () => {
  const mockEpisode = createMockEpisode({
    id: 'ep-1',
    podcastId: 'podcast-1',
    title: 'Test Episode',
    description: 'A test episode description',
    duration: 3600,
  });

  const mockPodcast = createMockPodcast({
    id: 'podcast-1',
    title: 'Test Podcast',
    artworkUrl: 'https://example.com/artwork.jpg',
    episodes: [mockEpisode],
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

  const renderEpisodeDetailScreen = (route = mockRoute) =>
    render(<EpisodeDetailScreen navigation={mockNavigation} route={route} />);

  describe('Rendering', () => {
    it('should render EpisodeDetailView with episode data from route params', () => {
      const { getByText } = renderEpisodeDetailScreen();

      expect(getByText('Test Episode')).toBeTruthy();
    });

    it('should display podcast title', () => {
      const { getByText } = renderEpisodeDetailScreen();

      expect(getByText('Test Podcast')).toBeTruthy();
    });

    it('should display episode description', () => {
      const { getByText } = renderEpisodeDetailScreen();

      expect(getByText('A test episode description')).toBeTruthy();
    });
  });

  describe('Navigation - Play Episode', () => {
    it('should navigate to FullPlayer when play button is pressed', () => {
      const { getByText } = renderEpisodeDetailScreen();

      fireEvent.press(getByText('Play'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('FullPlayer', {
        episode: mockEpisode,
        podcast: mockPodcast,
      });
    });
  });

  describe('Add to Queue', () => {
    it('should add episode to queue when Add to Queue button is pressed', async () => {
      const addToQueueSpy = jest.fn();
      queueStore.setState({
        queue: [],
        currentIndex: 0,
        addToQueue: addToQueueSpy,
      });

      const { getByText } = renderEpisodeDetailScreen();

      fireEvent.press(getByText('Add to Queue'));

      await waitFor(() => {
        expect(addToQueueSpy).toHaveBeenCalled();
        expect(Alert.alert).toHaveBeenCalledWith(
          'Added to Queue',
          expect.stringContaining('Test Episode'),
        );
      });
    });

    it('should show already in queue alert when episode is already in queue', async () => {
      queueStore.setState({
        queue: [
          {
            id: 'q-1',
            episode: mockEpisode,
            podcast: mockPodcast,
            position: 0,
          },
        ],
        currentIndex: 0,
      });

      const { getByText } = renderEpisodeDetailScreen();

      fireEvent.press(getByText('In Queue'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Already in Queue',
          'This episode is already in your queue.',
        );
      });
    });
  });

  describe('Not Found State', () => {
    it('should display not found state for non-existent episode', () => {
      const route = {
        ...mockRoute,
        params: { episodeId: 'non-existent', podcastId: 'podcast-1' },
      };

      const { getByText } = renderEpisodeDetailScreen(route);

      expect(getByText('Podcast Not Found')).toBeTruthy();
    });

    it('should display not found state for non-existent podcast', () => {
      const route = {
        ...mockRoute,
        params: { episodeId: 'ep-1', podcastId: 'non-existent' },
      };

      const { getByText } = renderEpisodeDetailScreen(route);

      expect(getByText('Podcast Not Found')).toBeTruthy();
    });
  });

  describe('Different Episode Data', () => {
    it('should render with different episode from route params', () => {
      const secondEpisode = createMockEpisode({
        id: 'ep-2',
        podcastId: 'podcast-1',
        title: 'Second Episode',
        description: 'Second episode description',
      });

      const updatedPodcast = createMockPodcast({
        ...mockPodcast,
        episodes: [mockEpisode, secondEpisode],
      });

      podcastStore.setState({
        podcasts: [updatedPodcast],
        loading: false,
        error: null,
      });

      const differentRoute = {
        ...mockRoute,
        params: { episodeId: 'ep-2', podcastId: 'podcast-1' },
      };

      const { getByText } = renderEpisodeDetailScreen(differentRoute);

      expect(getByText('Second Episode')).toBeTruthy();
      expect(getByText('Second episode description')).toBeTruthy();
    });
  });
});
