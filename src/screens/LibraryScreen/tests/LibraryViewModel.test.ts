import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useLibraryViewModel } from '../LibraryViewModel';
import { podcastStore } from '../../../stores';
import { createMockPodcasts } from '../../../__mocks__';

describe('LibraryViewModel', () => {
  const mockOnPodcastPress = jest.fn();
  const mockOnAddPodcastPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    podcastStore.setState({
      podcasts: [],
      loading: false,
      error: null,
    });
  });

  const renderViewModel = () =>
    renderHook(() =>
      useLibraryViewModel(mockOnPodcastPress, mockOnAddPodcastPress),
    );

  describe('Initial State', () => {
    it('should return initial state with empty podcasts', () => {
      const { result } = renderViewModel();

      expect(result.current.searchQuery).toBe('');
      expect(result.current.refreshing).toBe(false);
      expect(result.current.displayPodcasts).toEqual([]);
      expect(result.current.hasNoPodcasts).toBe(true);
    });

    it('should return podcasts when store has podcasts', () => {
      const mockPodcasts = createMockPodcasts(3);
      podcastStore.setState({
        podcasts: mockPodcasts,
        loading: false,
        error: null,
      });

      const { result } = renderViewModel();

      expect(result.current.displayPodcasts).toHaveLength(3);
      expect(result.current.hasNoPodcasts).toBe(false);
    });
  });

  describe('Loading State', () => {
    it('should set isLoading true when loading with no podcasts', () => {
      podcastStore.setState({
        podcasts: [],
        loading: true,
        error: null,
      });

      const { result } = renderViewModel();

      expect(result.current.isLoading).toBe(true);
    });

    it('should set isLoading false when loading with existing podcasts', () => {
      podcastStore.setState({
        podcasts: createMockPodcasts(2),
        loading: true,
        error: null,
      });

      const { result } = renderViewModel();

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Error State', () => {
    it('should set hasError truthy when error with no podcasts', () => {
      podcastStore.setState({
        podcasts: [],
        loading: false,
        error: 'Failed to load',
      });

      const { result } = renderViewModel();

      expect(result.current.hasError).toBeTruthy();
    });

    it('should set hasError false when error with existing podcasts', () => {
      podcastStore.setState({
        podcasts: createMockPodcasts(2),
        loading: false,
        error: 'Failed to load',
      });

      const { result } = renderViewModel();

      expect(result.current.hasError).toBe(false);
    });
  });

  describe('Search', () => {
    it('should update searchQuery when handleSearchQueryChange is called', () => {
      const { result } = renderViewModel();

      act(() => {
        result.current.handleSearchQueryChange('test query');
      });

      expect(result.current.searchQuery).toBe('test query');
    });

    it('should filter podcasts based on search query', () => {
      podcastStore.setState({
        podcasts: [
          ...createMockPodcasts(1),
          {
            ...createMockPodcasts(1)[0],
            id: 'unique-podcast',
            title: 'Unique Podcast Title',
          },
        ],
        loading: false,
        error: null,
      });

      const { result } = renderViewModel();

      act(() => {
        result.current.handleSearchQueryChange('Unique');
      });

      expect(result.current.displayPodcasts).toHaveLength(1);
      expect(result.current.displayPodcasts[0].title).toBe(
        'Unique Podcast Title',
      );
    });

    it('should set hasNoSearchResults when search returns empty', () => {
      podcastStore.setState({
        podcasts: createMockPodcasts(3),
        loading: false,
        error: null,
      });

      const { result } = renderViewModel();

      act(() => {
        result.current.handleSearchQueryChange('nonexistent podcast xyz');
      });

      expect(result.current.hasNoSearchResults).toBe(true);
    });
  });

  describe('Refresh', () => {
    it('should set refreshing to true then false when handleRefresh is called', async () => {
      jest.useFakeTimers();
      const { result } = renderViewModel();

      act(() => {
        result.current.handleRefresh();
      });

      expect(result.current.refreshing).toBe(true);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.refreshing).toBe(false);
      });

      jest.useRealTimers();
    });
  });

  describe('Navigation Handlers', () => {
    it('should call onPodcastPress when handlePodcastPress is called', () => {
      const { result } = renderViewModel();

      act(() => {
        result.current.handlePodcastPress('podcast-123');
      });

      expect(mockOnPodcastPress).toHaveBeenCalledWith('podcast-123');
      expect(mockOnPodcastPress).toHaveBeenCalledTimes(1);
    });

    it('should call onAddPodcastPress when handleAddPress is called', () => {
      const { result } = renderViewModel();

      act(() => {
        result.current.handleAddPress();
      });

      expect(mockOnAddPodcastPress).toHaveBeenCalledTimes(1);
    });
  });
});
