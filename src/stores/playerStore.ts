import { create } from 'zustand';

import { Episode } from '../models/Episode';

type PlaybackSpeed = 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1 | 1.1 | 1.2 | 1.3 | 1.4 | 1.5 | 1.6 | 1.7 | 1.8 | 1.9 | 2;

interface PlayerStore {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  position: number; // Current playback position in seconds
  duration: number; // Total episode duration in seconds
  speed: PlaybackSpeed; // Playback speed (0.5 to 2.0)
  setCurrentEpisode: (episode: Episode | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  reset: () => void; // Reset player to initial state
}

const playerStore = create<PlayerStore>((set) => ({
  currentEpisode: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  speed: 1,
  setCurrentEpisode: (episode) => set({ currentEpisode: episode }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),
  setSpeed: (speed) => set({ speed }),
  reset: () =>
    set({
      currentEpisode: null,
      isPlaying: false,
      position: 0,
      duration: 0,
      speed: 1,
    }),
}));

export default playerStore;
