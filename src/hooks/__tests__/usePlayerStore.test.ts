import { renderHook, act } from '@testing-library/react-native';
import { usePlayerStore } from '../usePlayerStore';
import playerStore from '../../stores/playerStore';
import { Episode } from '../../models/Episode';

describe('usePlayerStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    playerStore.setState({
      currentEpisode: null,
      isPlaying: false,
      position: 0,
      duration: 0,
      speed: 1,
    });
  });

  describe('playback state', () => {
    it('should update playing state', () => {
      const { result } = renderHook(() => usePlayerStore());

      expect(result.current.isPlaying).toBe(false);

      act(() => {
        result.current.setIsPlaying(true);
      });
      expect(result.current.isPlaying).toBe(true);

      act(() => {
        result.current.setIsPlaying(false);
      });
      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe('episode management', () => {
    it('should set current episode', () => {
      const mockEpisode: Episode = {
        id: 'e1',
        podcastId: 'p1',
        title: 'Episode 1',
        description: 'Test episode',
        audioUrl: 'https://example.com/audio.mp3',
        duration: 3600,
        publishDate: new Date().toISOString(),
        played: false,
      };

      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.setCurrentEpisode(mockEpisode);
      });
      expect(result.current.currentEpisode?.id).toBe('e1');

      act(() => {
        result.current.setCurrentEpisode(null);
      });
      expect(result.current.currentEpisode).toBeNull();
    });
  });

  describe('position and duration', () => {
    it('should update position', () => {
      const { result } = renderHook(() => usePlayerStore());

      expect(result.current.position).toBe(0);

      act(() => {
        result.current.setPosition(120);
      });
      expect(result.current.position).toBe(120);
    });

    it('should update duration', () => {
      const { result } = renderHook(() => usePlayerStore());

      expect(result.current.duration).toBe(0);

      act(() => {
        result.current.setDuration(3600);
      });
      expect(result.current.duration).toBe(3600);
    });
  });

  describe('playback speed', () => {
    it('should update speed to valid values', () => {
      const { result } = renderHook(() => usePlayerStore());

      expect(result.current.speed).toBe(1);

      act(() => {
        result.current.setSpeed(1.5);
      });
      expect(result.current.speed).toBe(1.5);

      act(() => {
        result.current.setSpeed(2);
      });
      expect(result.current.speed).toBe(2);
    });
  });

  describe('reset', () => {
    it('should reset all state to defaults', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.setIsPlaying(true);
        result.current.setPosition(1000);
        result.current.setDuration(3600);
        result.current.setSpeed(1.5);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.currentEpisode).toBeNull();
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.position).toBe(0);
      expect(result.current.duration).toBe(0);
      expect(result.current.speed).toBe(1);
    });
  });

  it('resets all player state', () => {
    const mockEpisode: Episode = {
      id: 'e1',
      podcastId: 'p1',
      title: 'Episode 1',
      description: 'Test episode',
      audioUrl: 'https://example.com/audio.mp3',
      duration: 3600,
      publishDate: new Date().toISOString(),
      played: false,
    };

    const { result } = renderHook(() => usePlayerStore());

    act(() => {
      result.current.setCurrentEpisode(mockEpisode);
      result.current.setIsPlaying(true);
      result.current.setPosition(1800);
      result.current.setDuration(3600);
      result.current.setSpeed(1.5);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.currentEpisode).toBeNull();
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.position).toBe(0);
    expect(result.current.duration).toBe(0);
    expect(result.current.speed).toBe(1);
  });
});
