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

    it('should add multiple episodes to queue with unique IDs', () => {
      const { getByText } = renderView();

      fireEvent.press(getByText('Add to Queue'));
      fireEvent.press(getByText('Add to Queue'));

      const queue = queueStore.getState().queue;
      expect(queue).toHaveLength(2);
      // Each queue item should have a unique ID
      expect(queue[0].id).not.toBe(queue[1].id);
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

    it('should display Up Next when there is a next item', () => {
      const queueItems = createMockQueueItems(2);
      queueStore.setState({
        queue: queueItems,
        currentIndex: 0,
      });

      const { getByText } = renderView();

      expect(getByText('Up Next')).toBeTruthy();
      expect(getByText(queueItems[1].episode.title)).toBeTruthy();
    });

    it('should display next episode podcast title', () => {
      const queueItems = createMockQueueItems(2);
      queueStore.setState({
        queue: queueItems,
        currentIndex: 0,
      });

      const { getByText } = renderView();

      expect(getByText(queueItems[1].podcast.title)).toBeTruthy();
    });
  });
});
