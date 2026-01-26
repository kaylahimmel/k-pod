import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { FullPlayerView } from '../FullPlayerView';
import { playerStore, queueStore, settingsStore } from '../../../stores';
import {
  MOCK_PLAYER_EPISODE,
  MOCK_PLAYER_PODCAST,
  createMockQueueItems,
} from '../../../__mocks__';

describe('FullPlayerView', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    playerStore.setState({
      currentEpisode: null,
      isPlaying: false,
      position: 0,
      duration: 3600,
      speed: 1,
    });
    queueStore.setState({
      queue: [],
      currentIndex: 0,
    });
    settingsStore.setState({
      settings: {
        autoPlayNext: true,
        defaultSpeed: 1,
        downloadOnWiFi: true,
        skipForwardSeconds: 30,
        skipBackwardSeconds: 15,
      },
      loading: false,
      error: null,
    });
  });

  const renderView = () =>
    render(
      <FullPlayerView
        episode={MOCK_PLAYER_EPISODE}
        podcast={MOCK_PLAYER_PODCAST}
        onDismiss={mockOnDismiss}
      />,
    );

  describe('Episode Info', () => {
    it('should display episode title', () => {
      const { getByText } = renderView();

      expect(getByText('Test Episode Title')).toBeTruthy();
    });

    it('should display podcast title', () => {
      const { getByText } = renderView();

      expect(getByText('Test Podcast Title')).toBeTruthy();
    });

    it('should display podcast artwork', () => {
      const { toJSON } = renderView();
      const tree = JSON.stringify(toJSON());

      expect(tree).toContain('https://example.com/artwork.jpg');
    });
  });

  describe('Playback Time', () => {
    it('should display formatted current time', () => {
      playerStore.setState({ position: 125, duration: 3600 }); // 2:05

      const { getByText } = renderView();

      expect(getByText('2:05')).toBeTruthy();
    });

    it('should display remaining time', () => {
      playerStore.setState({ position: 60, duration: 300 }); // -4:00 remaining

      const { getByText } = renderView();

      expect(getByText('-4:00')).toBeTruthy();
    });

    it('should display formatted time for longer durations', () => {
      playerStore.setState({ position: 3661, duration: 7200 }); // 1:01:01

      const { getByText } = renderView();

      expect(getByText('1:01:01')).toBeTruthy();
    });
  });

  describe('Playback Controls', () => {
    it('should display play button when paused', () => {
      playerStore.setState({ isPlaying: false });

      const { getByLabelText } = renderView();

      expect(getByLabelText('Play')).toBeTruthy();
    });

    it('should display pause button when playing', () => {
      playerStore.setState({ isPlaying: true });

      const { getByLabelText } = renderView();

      expect(getByLabelText('Pause')).toBeTruthy();
    });

    it('should toggle play state when play/pause is pressed', () => {
      playerStore.setState({ isPlaying: false });

      const { getByLabelText } = renderView();

      fireEvent.press(getByLabelText('Play'));

      expect(playerStore.getState().isPlaying).toBe(true);
    });

    it('should skip forward when skip forward button is pressed', () => {
      playerStore.setState({ position: 100, duration: 3600 });

      const { getByLabelText } = renderView();

      fireEvent.press(getByLabelText('Skip forward 30 seconds'));

      expect(playerStore.getState().position).toBe(130);
    });

    it('should skip backward when skip backward button is pressed', () => {
      playerStore.setState({ position: 100, duration: 3600 });

      const { getByLabelText } = renderView();

      fireEvent.press(getByLabelText('Skip backward 15 seconds'));

      expect(playerStore.getState().position).toBe(85);
    });

    it('should not skip backward below 0', () => {
      playerStore.setState({ position: 5, duration: 3600 });

      const { getByLabelText } = renderView();

      fireEvent.press(getByLabelText('Skip backward 15 seconds'));

      expect(playerStore.getState().position).toBe(0);
    });

    it('should not skip forward beyond duration', () => {
      playerStore.setState({ position: 3590, duration: 3600 });

      const { getByLabelText } = renderView();

      fireEvent.press(getByLabelText('Skip forward 30 seconds'));

      expect(playerStore.getState().position).toBe(3600);
    });

    it('should display skip seconds from settings', () => {
      settingsStore.setState({
        settings: {
          ...settingsStore.getState().settings,
          skipForwardSeconds: 45,
          skipBackwardSeconds: 10,
        },
        loading: false,
        error: null,
      });

      const { getByText } = renderView();

      expect(getByText('45s')).toBeTruthy();
      expect(getByText('10s')).toBeTruthy();
    });
  });

  describe('Speed Control', () => {
    it('should display current speed', () => {
      playerStore.setState({ speed: 1 });

      const { getByText } = renderView();

      expect(getByText('1x')).toBeTruthy();
    });

    it('should display non-default speed', () => {
      playerStore.setState({ speed: 1.5 });

      const { getByText } = renderView();

      expect(getByText('1.5x')).toBeTruthy();
    });

    it('should open speed picker modal when speed button is pressed', () => {
      const { getByText, getByLabelText } = renderView();

      fireEvent.press(getByLabelText('Playback speed 1x'));

      expect(getByText('Playback Speed')).toBeTruthy();
      expect(getByText('Done')).toBeTruthy();
    });

    it('should change speed when option is selected', async () => {
      playerStore.setState({ speed: 1 });

      const { getByLabelText, getByText, queryByText } = renderView();

      fireEvent.press(getByLabelText('Playback speed 1x'));
      fireEvent.press(getByText('1.5x'));

      await waitFor(() => {
        expect(playerStore.getState().speed).toBe(1.5);
        expect(queryByText('Playback Speed')).toBeNull(); // Modal closed
      });
    });

    it('should close speed picker when Done is pressed', async () => {
      const { getByLabelText, getByText, queryByText } = renderView();

      fireEvent.press(getByLabelText('Playback speed 1x'));
      expect(getByText('Playback Speed')).toBeTruthy();

      fireEvent.press(getByText('Done'));

      await waitFor(() => {
        expect(queryByText('Playback Speed')).toBeNull();
      });
    });
  });

  describe('Add to Queue', () => {
    it('should display Add to Queue button', () => {
      const { getByText } = renderView();

      expect(getByText('Add to Queue')).toBeTruthy();
    });

    it('should add episode to queue when button is pressed', () => {
      const { getByText } = renderView();

      fireEvent.press(getByText('Add to Queue'));

      const queue = queueStore.getState().queue;
      expect(queue).toHaveLength(1);
      expect(queue[0].episode.id).toBe('player-episode-1');
      expect(queue[0].podcast.id).toBe('player-podcast-1');
    });

    it('should hide Add to Queue button after episode is added', () => {
      const { getByText, queryByText } = renderView();

      // Button should be visible initially
      expect(getByText('Add to Queue')).toBeTruthy();

      fireEvent.press(getByText('Add to Queue'));

      // Button should be hidden after adding
      expect(queryByText('Add to Queue')).toBeNull();

      // Verify episode was added
      const queue = queueStore.getState().queue;
      expect(queue).toHaveLength(1);
    });

    it('should not show Add to Queue button when episode is already in queue', () => {
      // Pre-add the episode to the queue
      queueStore.setState({
        queue: [
          {
            id: 'existing-queue-item',
            episode: MOCK_PLAYER_EPISODE,
            podcast: MOCK_PLAYER_PODCAST,
            position: 0,
          },
        ],
        currentIndex: 0,
      });

      const { queryByText } = renderView();

      // Button should not be visible when episode is already in queue
      expect(queryByText('Add to Queue')).toBeNull();
    });
  });

  describe('Up Next Preview', () => {
    it('should not display Up Next when queue is empty', () => {
      const { queryByText } = renderView();

      expect(queryByText('Up Next')).toBeNull();
    });

    it('should not display Up Next when at last item in queue', () => {
      queueStore.setState({
        queue: createMockQueueItems(1),
        currentIndex: 0,
      });

      const { queryByText } = renderView();

      expect(queryByText('Up Next')).toBeNull();
    });
  });

  describe('Header Navigation', () => {
    it('should display back button', () => {
      const { getByLabelText } = renderView();

      expect(getByLabelText('Go back')).toBeTruthy();
    });

    it('should display close button', () => {
      const { getByLabelText } = renderView();

      expect(getByLabelText('Close player')).toBeTruthy();
    });

    it('should call onDismiss when back button is pressed', () => {
      const { getByLabelText } = renderView();

      fireEvent.press(getByLabelText('Go back'));

      expect(mockOnDismiss).toHaveBeenCalled();
    });

    it('should call onDismiss when close button is pressed', () => {
      const { getByLabelText } = renderView();

      fireEvent.press(getByLabelText('Close player'));

      expect(mockOnDismiss).toHaveBeenCalled();
    });
  });

  describe('Episode Description', () => {
    it('should display episode description preview', () => {
      const { getByText } = renderView();

      expect(getByText('A test episode for the full player')).toBeTruthy();
    });

    it('should display See more button', () => {
      const { getByText } = renderView();

      expect(getByText('See more')).toBeTruthy();
    });

    it('should toggle to See less when expanded', () => {
      const { getByText, queryByText } = renderView();

      fireEvent.press(getByText('See more'));

      expect(queryByText('See more')).toBeNull();
      expect(getByText('See less')).toBeTruthy();
    });

    it('should toggle back to See more when collapsed', () => {
      const { getByText, queryByText } = renderView();

      // Expand
      fireEvent.press(getByText('See more'));
      // Collapse
      fireEvent.press(getByText('See less'));

      expect(getByText('See more')).toBeTruthy();
      expect(queryByText('See less')).toBeNull();
    });
  });
});
