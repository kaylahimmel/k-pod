export interface PlaybackState {
  currentEpisodeId: string | null; // ID of the currently playing episode
  position: number; // Current playback position in seconds
  duration: number; // Total duration of the episode in seconds
  isPlaying: boolean; // Whether playback is currently active
  speed: number; // Playback speed (e.g., 1.0 for normal speed)
}
