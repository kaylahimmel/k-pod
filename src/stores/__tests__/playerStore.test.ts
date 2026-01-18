import { playerStore } from '../../stores';
import { Episode, PlaybackSpeed } from '../../models';

describe('playerStore', () => {
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

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const state = playerStore.getState();
      expect(state.currentEpisode).toBeNull();
      expect(state.isPlaying).toBe(false);
      expect(state.position).toBe(0);
      expect(state.duration).toBe(0);
      expect(state.speed).toBe(1);
    });
  });

  describe('setCurrentEpisode', () => {
    it('should set the current episode', () => {
      const mockEpisode: Episode = {
        id: '1',
        podcastId: 'podcast-1',
        title: 'Episode 1',
        description: 'Test episode',
        audioUrl: 'https://example.com/audio.mp3',
        duration: 3600,
        publishDate: new Date().toISOString(),
        played: false,
      };

      playerStore.getState().setCurrentEpisode(mockEpisode);

      expect(playerStore.getState().currentEpisode).toEqual(mockEpisode);
    });

    it('should set current episode to null', () => {
      const mockEpisode: Episode = {
        id: '1',
        podcastId: 'podcast-1',
        title: 'Episode 1',
        description: 'Test episode',
        audioUrl: 'https://example.com/audio.mp3',
        duration: 3600,
        publishDate: new Date().toISOString(),
        played: false,
      };

      playerStore.getState().setCurrentEpisode(mockEpisode);
      playerStore.getState().setCurrentEpisode(null);

      expect(playerStore.getState().currentEpisode).toBeNull();
    });
  });

  describe('setIsPlaying', () => {
    it('should set isPlaying to true', () => {
      playerStore.getState().setIsPlaying(true);
      expect(playerStore.getState().isPlaying).toBe(true);
    });

    it('should set isPlaying to false', () => {
      playerStore.getState().setIsPlaying(true);
      playerStore.getState().setIsPlaying(false);
      expect(playerStore.getState().isPlaying).toBe(false);
    });
  });

  describe('setPosition', () => {
    it('should update playback position', () => {
      playerStore.getState().setPosition(120);
      expect(playerStore.getState().position).toBe(120);
    });

    it('should handle fractional positions', () => {
      playerStore.getState().setPosition(123.456);
      expect(playerStore.getState().position).toBe(123.456);
    });

    it('should reset position to zero', () => {
      playerStore.getState().setPosition(500);
      playerStore.getState().setPosition(0);
      expect(playerStore.getState().position).toBe(0);
    });
  });

  describe('setDuration', () => {
    it('should set episode duration', () => {
      playerStore.getState().setDuration(3600);
      expect(playerStore.getState().duration).toBe(3600);
    });

    it('should update duration independently of position', () => {
      playerStore.getState().setPosition(500);
      playerStore.getState().setDuration(3600);
      expect(playerStore.getState().position).toBe(500);
      expect(playerStore.getState().duration).toBe(3600);
    });
  });

  describe('setSpeed', () => {
    it('should set playback speed', () => {
      playerStore.getState().setSpeed(1.5);
      expect(playerStore.getState().speed).toBe(1.5);
    });

    it('should handle various speed values', () => {
      const speeds: PlaybackSpeed[] = [
        0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9,
        2,
      ];
      speeds.forEach((speed) => {
        playerStore.getState().setSpeed(speed);
        expect(playerStore.getState().speed).toBe(speed);
      });
    });
  });

  describe('reset', () => {
    it('should reset all player state to initial values', () => {
      const mockEpisode: Episode = {
        id: '1',
        podcastId: 'podcast-1',
        title: 'Episode 1',
        description: 'Test episode',
        audioUrl: 'https://example.com/audio.mp3',
        duration: 3600,
        publishDate: new Date().toISOString(),
        played: false,
      };

      // Set various state values
      playerStore.getState().setCurrentEpisode(mockEpisode);
      playerStore.getState().setIsPlaying(true);
      playerStore.getState().setPosition(1800);
      playerStore.getState().setDuration(3600);
      playerStore.getState().setSpeed(1.5);

      // Verify state is set
      let state = playerStore.getState();
      expect(state.currentEpisode).not.toBeNull();
      expect(state.isPlaying).toBe(true);
      expect(state.position).toBe(1800);
      expect(state.duration).toBe(3600);
      expect(state.speed).toBe(1.5);

      // Reset and verify all values are back to defaults
      playerStore.getState().reset();
      state = playerStore.getState();
      expect(state.currentEpisode).toBeNull();
      expect(state.isPlaying).toBe(false);
      expect(state.position).toBe(0);
      expect(state.duration).toBe(0);
      expect(state.speed).toBe(1);
    });
  });
});
