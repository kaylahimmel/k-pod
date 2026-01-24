import { Episode, Podcast, PlaybackSpeed } from '../../models';

/**
 * Props passed from FullPlayerScreen to FullPlayerView
 */
export interface FullPlayerViewProps {
  episode: Episode;
  podcast: Podcast;
  onDismiss: () => void;
}

/**
 * Formatted playback time for display
 */
export interface FormattedPlaybackTime {
  current: string;
  remaining: string;
  total: string;
  progress: number; // 0 to 1
}

/**
 * Formatted speed display
 */
export interface FormattedSpeed {
  label: string;
  value: PlaybackSpeed;
}

/**
 * Formatted up next item for preview
 */
export interface FormattedUpNextItem {
  id: string;
  episodeTitle: string;
  podcastTitle: string;
  artworkUrl: string;
  formattedDuration: string;
}

/**
 * Return type of the FullPlayerViewModel hook
 */
export interface FullPlayerViewModel {
  // Display data
  episode: Episode;
  podcast: Podcast;
  playbackTime: FormattedPlaybackTime;
  speedDisplay: FormattedSpeed;
  upNextItem: FormattedUpNextItem | null;
  hasUpNext: boolean;

  // Player state
  isPlaying: boolean;
  position: number;
  duration: number;
  speed: PlaybackSpeed;

  // Handlers
  handlePlayPause: () => void;
  handleSkipForward: () => void;
  handleSkipBackward: () => void;
  handleSeek: (position: number) => void;
  handleSpeedChange: (speed: PlaybackSpeed) => void;
  handleAddToQueue: () => void;
  handleDismiss: () => void;
}

/**
 * Available playback speeds for the speed picker
 */
export const PLAYBACK_SPEEDS: PlaybackSpeed[] = [
  0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2,
];
