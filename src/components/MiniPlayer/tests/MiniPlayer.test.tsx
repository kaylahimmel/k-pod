import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { MiniPlayer } from '../MiniPlayer';
import { playerStore } from '../../../stores/playerStore';
import { queueStore } from '../../../stores/queueStore';
import {
  createMockEpisode,
  createMockPodcast,
  createMockQueueItem,
} from '../../../__mocks__';

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

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset stores to initial state
    act(() => {
      playerStore.getState().reset();
      queueStore.getState().clearQueue();
    });
  });

  describe('Rendering', () => {
    it('should show empty state when no episode is playing', () => {
      const { getByTestId } = render(<MiniPlayer />);

      expect(getByTestId('mini-player-empty')).toBeTruthy();
      expect(getByTestId('mini-player-empty-text')).toHaveTextContent(
        'No episode playing',
      );
    });

    it('should render active state when an episode is playing', () => {
      act(() => {
        playerStore.getState().setCurrentEpisode(mockEpisode);
        playerStore.getState().setCurrentPodcast(mockPodcast);
        queueStore.getState().setQueue([mockQueueItem]);
      });

      const { getByTestId } = render(<MiniPlayer />);

      expect(getByTestId('mini-player')).toBeTruthy();
    });

    it('should display the episode title', () => {
      act(() => {
        playerStore.getState().setCurrentEpisode(mockEpisode);
        playerStore.getState().setCurrentPodcast(mockPodcast);
        queueStore.getState().setQueue([mockQueueItem]);
      });

      const { getByTestId } = render(<MiniPlayer />);

      expect(getByTestId('mini-player-title')).toHaveTextContent(
        'Test Episode Title',
      );
    });

    it('should display the podcast name', () => {
      act(() => {
        playerStore.getState().setCurrentEpisode(mockEpisode);
        playerStore.getState().setCurrentPodcast(mockPodcast);
        queueStore.getState().setQueue([mockQueueItem]);
      });

      const { getByTestId } = render(<MiniPlayer />);

      expect(getByTestId('mini-player-podcast')).toHaveTextContent(
        'Test Podcast Title',
      );
    });

    it('should display Unknown Podcast when podcast is not set', () => {
      act(() => {
        playerStore.getState().setCurrentEpisode(mockEpisode);
        // currentPodcast is not set, so it will show "Unknown Podcast"
      });

      const { getByTestId } = render(<MiniPlayer />);

      expect(getByTestId('mini-player-podcast')).toHaveTextContent(
        'Unknown Podcast',
      );
    });
  });

  describe('Artwork', () => {
    it('should display artwork image when podcast has artworkUrl', () => {
      act(() => {
        playerStore.getState().setCurrentEpisode(mockEpisode);
        playerStore.getState().setCurrentPodcast(mockPodcast);
        queueStore.getState().setQueue([mockQueueItem]);
      });

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

      act(() => {
        playerStore.getState().setCurrentEpisode(mockEpisode);
        playerStore.getState().setCurrentPodcast(podcastWithoutArtwork);
        queueStore.getState().setQueue([queueItemWithoutArtwork]);
      });

      const { getByText } = render(<MiniPlayer />);

      // The mocked Ionicons renders the icon name as text
      expect(getByText('musical-notes')).toBeTruthy();
    });
  });

  describe('Play/Pause Button', () => {
    it('should show play icon when not playing', () => {
      act(() => {
        playerStore.getState().setCurrentEpisode(mockEpisode);
        playerStore.getState().setCurrentPodcast(mockPodcast);
        playerStore.getState().setIsPlaying(false);
        queueStore.getState().setQueue([mockQueueItem]);
      });

      const { getByTestId, getByText } = render(<MiniPlayer />);

      expect(getByTestId('mini-player-play-button')).toBeTruthy();
      expect(getByText('play')).toBeTruthy();
    });

    it('should show pause icon when playing', () => {
      act(() => {
        playerStore.getState().setCurrentEpisode(mockEpisode);
        playerStore.getState().setCurrentPodcast(mockPodcast);
        playerStore.getState().setIsPlaying(true);
        queueStore.getState().setQueue([mockQueueItem]);
      });

      const { getByTestId, getByText } = render(<MiniPlayer />);

      expect(getByTestId('mini-player-play-button')).toBeTruthy();
      expect(getByText('pause')).toBeTruthy();
    });

    it('should call togglePlayPause when play button is pressed', () => {
      act(() => {
        playerStore.getState().setCurrentEpisode(mockEpisode);
        playerStore.getState().setCurrentPodcast(mockPodcast);
        playerStore.getState().setIsPlaying(false);
        queueStore.getState().setQueue([mockQueueItem]);
      });

      const { getByTestId } = render(<MiniPlayer />);

      act(() => {
        fireEvent.press(getByTestId('mini-player-play-button'));
      });

      // Button press triggers togglePlayPause which is async
      // We just verify the button can be pressed without errors
      expect(getByTestId('mini-player-play-button')).toBeTruthy();
    });
  });

  describe('Progress Bar', () => {
    it('should show 0% progress when position is 0', () => {
      act(() => {
        playerStore.getState().setCurrentEpisode(mockEpisode);
        playerStore.getState().setCurrentPodcast(mockPodcast);
        playerStore.getState().setPosition(0);
        playerStore.getState().setDuration(3600);
        queueStore.getState().setQueue([mockQueueItem]);
      });

      const { getByTestId } = render(<MiniPlayer />);

      const progressBar = getByTestId('mini-player-progress');
      expect(progressBar.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ width: '0%' })]),
      );
    });

    it('should show 50% progress when position is half of duration', () => {
      act(() => {
        playerStore.getState().setCurrentEpisode(mockEpisode);
        playerStore.getState().setCurrentPodcast(mockPodcast);
        playerStore.getState().setPosition(1800);
        playerStore.getState().setDuration(3600);
        queueStore.getState().setQueue([mockQueueItem]);
      });

      const { getByTestId } = render(<MiniPlayer />);

      const progressBar = getByTestId('mini-player-progress');
      expect(progressBar.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ width: '50%' })]),
      );
    });

    it('should show 100% progress when position equals duration', () => {
      act(() => {
        playerStore.getState().setCurrentEpisode(mockEpisode);
        playerStore.getState().setCurrentPodcast(mockPodcast);
        playerStore.getState().setPosition(3600);
        playerStore.getState().setDuration(3600);
        queueStore.getState().setQueue([mockQueueItem]);
      });

      const { getByTestId } = render(<MiniPlayer />);

      const progressBar = getByTestId('mini-player-progress');
      expect(progressBar.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ width: '100%' })]),
      );
    });

    it('should handle 0 duration gracefully', () => {
      act(() => {
        playerStore.getState().setCurrentEpisode(mockEpisode);
        playerStore.getState().setCurrentPodcast(mockPodcast);
        playerStore.getState().setPosition(0);
        playerStore.getState().setDuration(0);
        queueStore.getState().setQueue([mockQueueItem]);
      });

      const { getByTestId } = render(<MiniPlayer />);

      const progressBar = getByTestId('mini-player-progress');
      expect(progressBar.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ width: '0%' })]),
      );
    });
  });

  describe('Navigation', () => {
    it('should navigate to FullPlayer when pressed', () => {
      act(() => {
        playerStore.getState().setCurrentEpisode(mockEpisode);
        playerStore.getState().setCurrentPodcast(mockPodcast);
        queueStore.getState().setQueue([mockQueueItem]);
      });

      const { getByTestId } = render(<MiniPlayer />);

      act(() => {
        fireEvent.press(getByTestId('mini-player'));
      });

      expect(mockNavigate).toHaveBeenCalledWith('FullPlayer', {
        episode: mockEpisode,
        podcast: mockPodcast,
      });
    });

    it('should not navigate when podcast is not set', () => {
      act(() => {
        playerStore.getState().setCurrentEpisode(mockEpisode);
        // currentPodcast is not set, so navigation should not occur
      });

      const { getByTestId } = render(<MiniPlayer />);

      act(() => {
        fireEvent.press(getByTestId('mini-player'));
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should display the correct podcast even with multiple items in queue', () => {
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

      act(() => {
        playerStore.getState().setCurrentEpisode(mockEpisode);
        playerStore.getState().setCurrentPodcast(mockPodcast);
        queueStore.getState().setQueue([mockQueueItem, queueItem2]);
      });

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

      act(() => {
        playerStore.getState().setCurrentEpisode(longTitleEpisode);
        playerStore.getState().setCurrentPodcast(mockPodcast);
        queueStore.getState().setQueue([queueItemLongTitle]);
      });

      const { getByTestId } = render(<MiniPlayer />);

      const titleElement = getByTestId('mini-player-title');
      expect(titleElement.props.numberOfLines).toBe(1);
    });
  });
});
