import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { EpisodeDetailView } from '../EpisodeDetailView';
import { podcastStore, queueStore } from '../../../stores';
import { createMockPodcast, createMockEpisode } from '../../../__mocks__';

jest.spyOn(Alert, 'alert');

describe('EpisodeDetailView', () => {
  const mockOnPlayEpisode = jest.fn();
  const mockOnGoBack = jest.fn();

  const mockEpisode = createMockEpisode({
    id: 'ep-1',
    podcastId: 'podcast-1',
    title: 'Test Episode Title',
    description: 'This is a test episode description for testing purposes.',
    duration: 3600, // 1 hour
    publishDate: '2024-06-15T00:00:00Z',
    played: false,
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

  const renderEpisodeDetailView = (
    episodeId = 'ep-1',
    podcastId = 'podcast-1',
  ) =>
    render(
      <EpisodeDetailView
        episodeId={episodeId}
        podcastId={podcastId}
        onPlayEpisode={mockOnPlayEpisode}
        onGoBack={mockOnGoBack}
      />,
    );

  describe('Loading State', () => {
    it('should display loading state when loading', () => {
      podcastStore.setState({ loading: true, podcasts: [] });

      const { getByText } = renderEpisodeDetailView();

      expect(getByText('Loading episode...')).toBeTruthy();
    });
  });

  describe('Not Found State', () => {
    it('should display not found state when episode does not exist', () => {
      const { getByText } = renderEpisodeDetailView(
        'non-existent',
        'podcast-1',
      );

      expect(getByText('Podcast Not Found')).toBeTruthy();
    });

    it('should display not found state when podcast does not exist', () => {
      const { getByText } = renderEpisodeDetailView('ep-1', 'non-existent');

      expect(getByText('Podcast Not Found')).toBeTruthy();
    });
  });

  describe('Header Section', () => {
    it('should display podcast title', () => {
      const { getByText } = renderEpisodeDetailView();

      expect(getByText('Test Podcast')).toBeTruthy();
    });

    it('should display episode title', () => {
      const { getByText } = renderEpisodeDetailView();

      expect(getByText('Test Episode Title')).toBeTruthy();
    });

    it('should display formatted duration', () => {
      const { getByText } = renderEpisodeDetailView();

      // 3600 seconds = 1 hour
      expect(getByText('1 hr')).toBeTruthy();
    });

    it('should display formatted publish date', () => {
      const { getByText } = renderEpisodeDetailView();

      // Should display formatted date (may vary by timezone)
      expect(getByText(/Jun 1[45], 2024/)).toBeTruthy();
    });

    it('should display played badge when episode is played', () => {
      const playedEpisode = createMockEpisode({
        ...mockEpisode,
        played: true,
      });

      const updatedPodcast = createMockPodcast({
        ...mockPodcast,
        episodes: [playedEpisode],
      });

      podcastStore.setState({
        podcasts: [updatedPodcast],
        loading: false,
        error: null,
      });

      const { getByText } = renderEpisodeDetailView();

      expect(getByText('Played')).toBeTruthy();
    });
  });

  describe('Action Buttons', () => {
    it('should display Play button', () => {
      const { getByText } = renderEpisodeDetailView();

      expect(getByText('Play')).toBeTruthy();
    });

    it('should display Add to Queue button when not in queue', () => {
      const { getByText } = renderEpisodeDetailView();

      expect(getByText('Add to Queue')).toBeTruthy();
    });

    it('should display In Queue button when episode is in queue', () => {
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

      const { getByText } = renderEpisodeDetailView();

      expect(getByText('In Queue')).toBeTruthy();
    });

    it('should call onPlayEpisode when Play button is pressed', () => {
      const { getByText } = renderEpisodeDetailView();

      fireEvent.press(getByText('Play'));

      expect(mockOnPlayEpisode).toHaveBeenCalledWith(mockEpisode, mockPodcast);
    });

    it('should add episode to queue when Add to Queue is pressed', async () => {
      const addToQueueSpy = jest.fn();
      queueStore.setState({
        queue: [],
        currentIndex: 0,
        addToQueue: addToQueueSpy,
      });

      const { getByText } = renderEpisodeDetailView();

      fireEvent.press(getByText('Add to Queue'));

      await waitFor(() => {
        expect(addToQueueSpy).toHaveBeenCalled();
        expect(Alert.alert).toHaveBeenCalledWith(
          'Added to Queue',
          expect.stringContaining('Test Episode Title'),
        );
      });
    });

    it('should show alert when pressing In Queue button', async () => {
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

      const { getByText } = renderEpisodeDetailView();

      fireEvent.press(getByText('In Queue'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Already in Queue',
          'This episode is already in your queue.',
        );
      });
    });
  });

  describe('Description Section', () => {
    it('should display Episode Notes label', () => {
      const { getByText } = renderEpisodeDetailView();

      expect(getByText('Episode Notes')).toBeTruthy();
    });

    it('should display episode description', () => {
      const { getByText } = renderEpisodeDetailView();

      expect(
        getByText('This is a test episode description for testing purposes.'),
      ).toBeTruthy();
    });

    it('should display fallback text when no description', () => {
      const noDescEpisode = createMockEpisode({
        ...mockEpisode,
        description: '',
      });

      const updatedPodcast = createMockPodcast({
        ...mockPodcast,
        episodes: [noDescEpisode],
      });

      podcastStore.setState({
        podcasts: [updatedPodcast],
        loading: false,
        error: null,
      });

      const { getByText } = renderEpisodeDetailView();

      expect(getByText('No description available.')).toBeTruthy();
    });
  });

  describe('Different Episode Data', () => {
    it('should render with different episode', () => {
      const secondEpisode = createMockEpisode({
        id: 'ep-2',
        podcastId: 'podcast-1',
        title: 'Another Episode',
        description: 'Another description',
        duration: 1800, // 30 minutes
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

      const { getByText } = renderEpisodeDetailView('ep-2', 'podcast-1');

      expect(getByText('Another Episode')).toBeTruthy();
      expect(getByText('Another description')).toBeTruthy();
    });
  });
});
