import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { usePodcastDetailViewModel } from '../PodcastDetailViewModel';
import { podcastStore, queueStore } from '../../../stores';
import {
  createMockPodcast,
  createMockEpisode,
  createMockQueueItem,
} from '../../../__mocks__';
import { RSSService } from '../../../services/RSSService';

jest.spyOn(Alert, 'alert');

jest.mock('../../../services/RSSService', () => ({
  RSSService: {
    refreshEpisodes: jest.fn(),
  },
}));

describe('usePodcastDetailViewModel', () => {
  const mockOnEpisodePress = jest.fn();
  const mockOnPlayEpisode = jest.fn();
  const mockOnUnsubscribe = jest.fn();

  const mockEpisode = createMockEpisode({
    id: 'ep-1',
    podcastId: 'podcast-1',
    title: 'Test Episode',
    description: 'Episode description',
    duration: 3600,
  });

  const mockPodcast = createMockPodcast({
    id: 'podcast-1',
    title: 'Test Podcast',
    author: 'Test Author',
    description: 'Podcast description',
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

  const renderViewModel = (podcastId = 'podcast-1') =>
    renderHook(() =>
      usePodcastDetailViewModel(
        podcastId,
        mockOnEpisodePress,
        mockOnPlayEpisode,
        mockOnUnsubscribe,
      ),
    );

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderViewModel();

      expect(result.current.refreshing).toBe(false);
      expect(result.current.showFullDescription).toBe(false);
      expect(result.current.showAllEpisodes).toBe(false);
      expect(result.current.loading).toBe(false);
    });

    it('should find and return podcast from store', () => {
      const { result } = renderViewModel();

      expect(result.current.podcast).toEqual(mockPodcast);
    });

    it('should return null podcast when not found', () => {
      const { result } = renderViewModel('non-existent');

      expect(result.current.podcast).toBeUndefined();
      expect(result.current.formattedPodcast).toBeNull();
    });

    it('should return formatted podcast data', () => {
      const { result } = renderViewModel();

      expect(result.current.formattedPodcast).not.toBeNull();
      expect(result.current.formattedPodcast?.title).toBe('Test Podcast');
      expect(result.current.formattedPodcast?.author).toBe('Test Author');
    });
  });

  describe('handleEpisodeRefresh', () => {
    it('should set refreshing to true then false after refresh completes', async () => {
      (RSSService.refreshEpisodes as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockEpisode],
      });

      const { result } = renderViewModel();

      await act(async () => {
        result.current.handleEpisodeRefresh();
      });

      // After async operation completes, refreshing should be false
      await waitFor(() => {
        expect(result.current.refreshing).toBe(false);
      });
    });

    it('should call RSSService.refreshEpisodes with correct params', async () => {
      (RSSService.refreshEpisodes as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockEpisode],
      });

      const { result } = renderViewModel();

      await act(async () => {
        result.current.handleEpisodeRefresh();
      });

      expect(RSSService.refreshEpisodes).toHaveBeenCalledWith(
        'podcast-1',
        mockPodcast.rssUrl,
      );
    });

    it('should not call refresh if podcast is not found', async () => {
      const { result } = renderViewModel('non-existent');

      await act(async () => {
        result.current.handleEpisodeRefresh();
      });

      expect(RSSService.refreshEpisodes).not.toHaveBeenCalled();
    });
  });

  describe('handleEpisodeUnsubscribe', () => {
    it('should show confirmation alert', () => {
      const { result } = renderViewModel();

      act(() => {
        result.current.handleEpisodeUnsubscribe();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Unsubscribe',
        'Are you sure you want to unsubscribe from "Test Podcast"?',
        expect.any(Array),
      );
    });

    it('should call onUnsubscribe when confirmed', () => {
      const { result } = renderViewModel();

      act(() => {
        result.current.handleEpisodeUnsubscribe();
      });

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const unsubscribeButton = alertCall[2].find(
        (btn: { text: string }) => btn.text === 'Unsubscribe',
      );

      act(() => {
        unsubscribeButton.onPress();
      });

      expect(mockOnUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('handleEpisodeAddToQueue', () => {
    it('should add episode to queue', () => {
      const addToQueueSpy = jest.fn();
      queueStore.setState({
        queue: [],
        currentIndex: 0,
        addToQueue: addToQueueSpy,
      });

      const { result } = renderViewModel();

      act(() => {
        result.current.handleEpisodeAddToQueue(mockEpisode);
      });

      expect(addToQueueSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          episode: mockEpisode,
          podcast: mockPodcast,
        }),
      );
    });

    it('should not add episode if already in queue', () => {
      const addToQueueSpy = jest.fn();
      queueStore.setState({
        queue: [createMockQueueItem({ episode: mockEpisode })],
        currentIndex: 0,
        addToQueue: addToQueueSpy,
      });

      const { result } = renderViewModel();

      act(() => {
        result.current.handleEpisodeAddToQueue(mockEpisode);
      });

      expect(addToQueueSpy).not.toHaveBeenCalled();
    });

    it('should not add episode if podcast is not found', () => {
      const addToQueueSpy = jest.fn();
      queueStore.setState({
        queue: [],
        currentIndex: 0,
        addToQueue: addToQueueSpy,
      });

      const { result } = renderViewModel('non-existent');

      act(() => {
        result.current.handleEpisodeAddToQueue(mockEpisode);
      });

      expect(addToQueueSpy).not.toHaveBeenCalled();
    });
  });

  describe('isEpisodeInQueue', () => {
    it('should return true when episode is in queue', () => {
      queueStore.setState({
        queue: [createMockQueueItem({ episode: mockEpisode })],
        currentIndex: 0,
      });

      const { result } = renderViewModel();

      expect(result.current.isEpisodeInQueue('ep-1')).toBe(true);
    });

    it('should return false when episode is not in queue', () => {
      queueStore.setState({
        queue: [],
        currentIndex: 0,
      });

      const { result } = renderViewModel();

      expect(result.current.isEpisodeInQueue('ep-1')).toBe(false);
    });
  });

  describe('handleEpisodePlayEpisode', () => {
    it('should call onPlayEpisode with episode and podcast', () => {
      const { result } = renderViewModel();

      act(() => {
        result.current.handleEpisodePlayEpisode(mockEpisode);
      });

      expect(mockOnPlayEpisode).toHaveBeenCalledWith(mockEpisode, mockPodcast);
    });

    it('should not call onPlayEpisode if podcast is not found', () => {
      const { result } = renderViewModel('non-existent');

      act(() => {
        result.current.handleEpisodePlayEpisode(mockEpisode);
      });

      expect(mockOnPlayEpisode).not.toHaveBeenCalled();
    });
  });

  describe('toggleEpisodeDescription', () => {
    it('should toggle showFullDescription state', () => {
      const { result } = renderViewModel();

      expect(result.current.showFullDescription).toBe(false);

      act(() => {
        result.current.toggleEpisodeDescription();
      });

      expect(result.current.showFullDescription).toBe(true);

      act(() => {
        result.current.toggleEpisodeDescription();
      });

      expect(result.current.showFullDescription).toBe(false);
    });
  });

  describe('toggleShowAllEpisodes', () => {
    it('should toggle showAllEpisodes state', () => {
      const { result } = renderViewModel();

      expect(result.current.showAllEpisodes).toBe(false);

      act(() => {
        result.current.toggleShowAllEpisodes();
      });

      expect(result.current.showAllEpisodes).toBe(true);

      act(() => {
        result.current.toggleShowAllEpisodes();
      });

      expect(result.current.showAllEpisodes).toBe(false);
    });
  });

  describe('getEpisodeRawData', () => {
    it('should return episode by id', () => {
      const { result } = renderViewModel();

      const episode = result.current.getEpisodeRawData('ep-1');

      expect(episode).toEqual(mockEpisode);
    });

    it('should return undefined for non-existent episode', () => {
      const { result } = renderViewModel();

      const episode = result.current.getEpisodeRawData('non-existent');

      expect(episode).toBeUndefined();
    });

    it('should return undefined when podcast not found', () => {
      const { result } = renderViewModel('non-existent');

      const episode = result.current.getEpisodeRawData('ep-1');

      expect(episode).toBeUndefined();
    });
  });

  describe('onEpisodePress', () => {
    it('should pass through onEpisodePress callback', () => {
      const { result } = renderViewModel();

      expect(result.current.onEpisodePress).toBe(mockOnEpisodePress);
    });
  });
});
