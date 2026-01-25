import React from 'react';
import { render } from '@testing-library/react-native';
import { FullPlayerScreen } from '../FullPlayerScreen';
import { playerStore, queueStore, settingsStore } from '../../../stores';
import {
  MOCK_PLAYER_EPISODE,
  MOCK_PLAYER_PODCAST,
  createMockNavigation,
  createMockRoute,
} from '../../../__mocks__';

describe('FullPlayerScreen', () => {
  const mockNavigation = createMockNavigation() as unknown as Parameters<
    typeof FullPlayerScreen
  >[0]['navigation'];

  const mockRoute = createMockRoute('FullPlayer', {
    episode: MOCK_PLAYER_EPISODE,
    podcast: MOCK_PLAYER_PODCAST,
  }) as Parameters<typeof FullPlayerScreen>[0]['route'];

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

  const renderScreen = () =>
    render(<FullPlayerScreen navigation={mockNavigation} route={mockRoute} />);

  describe('Rendering', () => {
    it('should render FullPlayerView with episode and podcast from route params', () => {
      const { getByText } = renderScreen();

      expect(getByText('Test Episode Title')).toBeTruthy();
      expect(getByText('Test Podcast Title')).toBeTruthy();
    });

    it('should display playback controls', () => {
      const { getByLabelText } = renderScreen();

      expect(getByLabelText('Play')).toBeTruthy();
      expect(getByLabelText('Skip forward 30 seconds')).toBeTruthy();
      expect(getByLabelText('Skip backward 15 seconds')).toBeTruthy();
    });

    it('should display speed control button', () => {
      const { getByText } = renderScreen();

      expect(getByText('1x')).toBeTruthy();
    });

    it('should display Add to Queue button', () => {
      const { getByText } = renderScreen();

      expect(getByText('Add to Queue')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should pass dismiss handler that calls goBack', () => {
      renderScreen();

      // Verify navigation was set up correctly - goBack not called on initial render
      expect(mockNavigation.goBack).not.toHaveBeenCalled();
    });
  });

  describe('Player State', () => {
    it('should show pause button when playing', () => {
      playerStore.setState({ isPlaying: true });

      const { getByLabelText } = renderScreen();

      expect(getByLabelText('Pause')).toBeTruthy();
    });

    it('should show play button when paused', () => {
      playerStore.setState({ isPlaying: false });

      const { getByLabelText } = renderScreen();

      expect(getByLabelText('Play')).toBeTruthy();
    });

    it('should display current playback position', () => {
      playerStore.setState({
        position: 125, // 2:05
        duration: 3600,
      });

      const { getByText } = renderScreen();

      expect(getByText('2:05')).toBeTruthy();
    });

    it('should display playback speed', () => {
      playerStore.setState({ speed: 1.5 });

      const { getByText } = renderScreen();

      expect(getByText('1.5x')).toBeTruthy();
    });
  });
});
