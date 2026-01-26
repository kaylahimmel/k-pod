import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MiniPlayer } from '../MiniPlayer';
import { playerStore } from '../../../stores/playerStore';
import { queueStore } from '../../../stores/queueStore';
import {
  createMockEpisode,
  createMockPodcast,
  createMockQueueItem,
} from '../../../__mocks__';

// Mock the stores
jest.mock('../../../stores/playerStore', () => ({
  playerStore: jest.fn(),
}));

jest.mock('../../../stores/queueStore', () => ({
  queueStore: jest.fn(),
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('MiniPlayer', () => {
  const mockEpisode = createMockEpisode({
    id: 'episode-1',
    title: 'Test Episode Title',
  });

  const mockPodcast = createMockPodcast({
    id: 'podcast-1',
    title: 'Test Podcast Title',
    artworkUrl: 'https://example.com/artwork.jpg',
  });

  const mockQueueItem = createMockQueueItem({
    id: 'queue-1',
    episode: mockEpisode,
    podcast: mockPodcast,
    position: 0,
  });

  const mockSetIsPlaying = jest.fn();

  interface PlayerState {
    currentEpisode: typeof mockEpisode | null;
    isPlaying: boolean;
    position: number;
    duration: number;
    setIsPlaying: jest.Mock;
  }

  const setupPlayerStoreMock = (overrides: Partial<PlayerState> = {}) => {
    const defaultState: PlayerState = {
      currentEpisode: mockEpisode,
      isPlaying: false,
      position: 0,
      duration: 3600,
      setIsPlaying: mockSetIsPlaying,
    };

    const state: PlayerState = { ...defaultState, ...overrides };

    (playerStore as unknown as jest.Mock).mockImplementation(
      (selector: (state: PlayerState) => unknown) => selector(state),
    );
  };

  const setupQueueStoreMock = (queue: (typeof mockQueueItem)[]) => {
    (queueStore as unknown as jest.Mock).mockImplementation(
      (selector: (state: { queue: typeof queue }) => unknown) =>
        selector({ queue }),
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupPlayerStoreMock({});
    setupQueueStoreMock([mockQueueItem]);
  });

  describe('Rendering', () => {
    it('should show empty state when no episode is playing', () => {
      setupPlayerStoreMock({ currentEpisode: null });

      const { getByTestId } = render(<MiniPlayer />);

      expect(getByTestId('mini-player-empty')).toBeTruthy();
      expect(getByTestId('mini-player-empty-text')).toHaveTextContent(
        'No episode playing',
      );
    });

    it('should render active state when an episode is playing', () => {
      const { getByTestId } = render(<MiniPlayer />);

      expect(getByTestId('mini-player')).toBeTruthy();
    });

    it('should display the episode title', () => {
      const { getByTestId } = render(<MiniPlayer />);

      expect(getByTestId('mini-player-title')).toHaveTextContent(
        'Test Episode Title',
      );
    });

    it('should display the podcast name', () => {
      const { getByTestId } = render(<MiniPlayer />);

      expect(getByTestId('mini-player-podcast')).toHaveTextContent(
        'Test Podcast Title',
      );
    });

    it('should display Unknown Podcast when podcast is not found', () => {
      setupQueueStoreMock([]);

      const { getByTestId } = render(<MiniPlayer />);

      expect(getByTestId('mini-player-podcast')).toHaveTextContent(
        'Unknown Podcast',
      );
    });
  });

  describe('Artwork', () => {
    it('should display artwork image when podcast has artworkUrl', () => {
      const { getByTestId } = render(<MiniPlayer />);

      expect(getByTestId('mini-player-artwork')).toBeTruthy();
    });

    it('should display placeholder icon when podcast has no artworkUrl', () => {
      const podcastWithoutArtwork = createMockPodcast({
        id: 'podcast-1',
        artworkUrl: '',
      });
      const queueItemWithoutArtwork = createMockQueueItem({
        episode: mockEpisode,
        podcast: podcastWithoutArtwork,
      });
      setupQueueStoreMock([queueItemWithoutArtwork]);

      const { getByText } = render(<MiniPlayer />);

      // The mocked Ionicons renders the icon name as text
      expect(getByText('musical-notes')).toBeTruthy();
    });
  });

  describe('Play/Pause Button', () => {
    it('should show play icon when not playing', () => {
      setupPlayerStoreMock({ isPlaying: false });

      const { getByTestId, getByText } = render(<MiniPlayer />);

      expect(getByTestId('mini-player-play-button')).toBeTruthy();
      expect(getByText('play')).toBeTruthy();
    });

    it('should show pause icon when playing', () => {
      setupPlayerStoreMock({ isPlaying: true });

      const { getByTestId, getByText } = render(<MiniPlayer />);

      expect(getByTestId('mini-player-play-button')).toBeTruthy();
      expect(getByText('pause')).toBeTruthy();
    });

    it('should toggle playback when play button is pressed', () => {
      setupPlayerStoreMock({ isPlaying: false });

      const { getByTestId } = render(<MiniPlayer />);

      fireEvent.press(getByTestId('mini-player-play-button'));

      expect(mockSetIsPlaying).toHaveBeenCalledWith(true);
    });

    it('should toggle playback to pause when already playing', () => {
      setupPlayerStoreMock({ isPlaying: true });

      const { getByTestId } = render(<MiniPlayer />);

      fireEvent.press(getByTestId('mini-player-play-button'));

      expect(mockSetIsPlaying).toHaveBeenCalledWith(false);
    });
  });

  describe('Progress Bar', () => {
    it('should show 0% progress when position is 0', () => {
      setupPlayerStoreMock({ position: 0, duration: 3600 });

      const { getByTestId } = render(<MiniPlayer />);

      const progressBar = getByTestId('mini-player-progress');
      expect(progressBar.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ width: '0%' })]),
      );
    });

    it('should show 50% progress when position is half of duration', () => {
      setupPlayerStoreMock({ position: 1800, duration: 3600 });

      const { getByTestId } = render(<MiniPlayer />);

      const progressBar = getByTestId('mini-player-progress');
      expect(progressBar.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ width: '50%' })]),
      );
    });

    it('should show 100% progress when position equals duration', () => {
      setupPlayerStoreMock({ position: 3600, duration: 3600 });

      const { getByTestId } = render(<MiniPlayer />);

      const progressBar = getByTestId('mini-player-progress');
      expect(progressBar.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ width: '100%' })]),
      );
    });

    it('should handle 0 duration gracefully', () => {
      setupPlayerStoreMock({ position: 0, duration: 0 });

      const { getByTestId } = render(<MiniPlayer />);

      const progressBar = getByTestId('mini-player-progress');
      expect(progressBar.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ width: '0%' })]),
      );
    });
  });

  describe('Navigation', () => {
    it('should navigate to FullPlayer when pressed', () => {
      const { getByTestId } = render(<MiniPlayer />);

      fireEvent.press(getByTestId('mini-player'));

      expect(mockNavigate).toHaveBeenCalledWith('FullPlayer', {
        episode: mockEpisode,
        podcast: mockPodcast,
      });
    });

    it('should not navigate when podcast is not found', () => {
      setupQueueStoreMock([]);

      const { getByTestId } = render(<MiniPlayer />);

      fireEvent.press(getByTestId('mini-player'));

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should find correct podcast from queue when multiple items exist', () => {
      const episode2 = createMockEpisode({
        id: 'episode-2',
        title: 'Episode 2',
      });
      const podcast2 = createMockPodcast({
        id: 'podcast-2',
        title: 'Podcast 2',
      });
      const queueItem2 = createMockQueueItem({
        id: 'queue-2',
        episode: episode2,
        podcast: podcast2,
        position: 1,
      });

      setupQueueStoreMock([mockQueueItem, queueItem2]);
      setupPlayerStoreMock({ currentEpisode: mockEpisode });

      const { getByTestId } = render(<MiniPlayer />);

      expect(getByTestId('mini-player-podcast')).toHaveTextContent(
        'Test Podcast Title',
      );
    });

    it('should handle long episode titles with numberOfLines', () => {
      const longTitleEpisode = createMockEpisode({
        id: 'episode-1',
        title: 'This is a very long episode title that should be truncated',
      });
      const queueItemLongTitle = createMockQueueItem({
        episode: longTitleEpisode,
        podcast: mockPodcast,
      });
      setupPlayerStoreMock({ currentEpisode: longTitleEpisode });
      setupQueueStoreMock([queueItemLongTitle]);

      const { getByTestId } = render(<MiniPlayer />);

      const titleElement = getByTestId('mini-player-title');
      expect(titleElement.props.numberOfLines).toBe(1);
    });
  });
});
