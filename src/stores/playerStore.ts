import { create } from 'zustand';
import { PlayerStore } from '../models';

export const playerStore = create<PlayerStore>((set) => ({
  currentEpisode: null,
  currentPodcast: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  speed: 1,
  setCurrentEpisode: (episode) => set({ currentEpisode: episode }),
  setCurrentPodcast: (podcast) => set({ currentPodcast: podcast }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),
  setSpeed: (speed) => set({ speed }),
  reset: () =>
    set({
      currentEpisode: null,
      currentPodcast: null,
      isPlaying: false,
      position: 0,
      duration: 0,
      speed: 1,
    }),
}));
