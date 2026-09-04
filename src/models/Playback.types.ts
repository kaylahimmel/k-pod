import { Episode } from './Episode.types';
import { Podcast } from './Podcast.types';

/**
 * Playback speed options (0.5x to 2x in 0.1 increments, plus the 0.25-step
 * values the Settings default-speed picker offers)
 */
export type PlaybackSpeed =
  | 0.5
  | 0.6
  | 0.7
  | 0.75
  | 0.8
  | 0.9
  | 1
  | 1.1
  | 1.2
  | 1.25
  | 1.3
  | 1.4
  | 1.5
  | 1.6
  | 1.7
  | 1.75
  | 1.8
  | 1.9
  | 2;

export interface PlaybackState {
  currentEpisodeId: string | null; // ID of the currently playing episode
  position: number; // Current playback position in seconds
  duration: number; // Total duration of the episode in seconds
  isPlaying: boolean; // Whether playback is currently active
  speed: PlaybackSpeed; // Playback speed (0.5x to 2x)
}

/**
 * Snapshot of the current playback state returned by AudioPlayerService.getStatus().
 * Uses seconds throughout so consumers never deal with vendor-specific units.
 */
export interface PlaybackStatus {
  positionSeconds: number;
  durationSeconds: number;
  isPlaying: boolean;
}

/**
 * Callback types for playback events
 */
export type OnProgressCallback = (position: number, duration: number) => void;
export type OnEndCallback = () => void;
export type OnErrorCallback = (error: string) => void;

export interface PlayerStore {
  currentEpisode: Episode | null;
  currentPodcast: Podcast | null;
  isPlaying: boolean;
  position: number; // Current playback position in seconds
  duration: number; // Total episode duration in seconds
  speed: PlaybackSpeed; // Playback speed (0.5 to 2.0)
  setCurrentEpisode: (episode: Episode | null) => void;
  setCurrentPodcast: (podcast: Podcast | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  reset: () => void; // Reset player to initial state
}
