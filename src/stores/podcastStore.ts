import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PodcastStore } from '../models';
import { STORAGE_KEYS } from '../constants';

export const podcastStore = create<PodcastStore>()(
  persist(
    (set) => ({
      podcasts: [],
      loading: false,
      error: null,
      setPodcasts: (podcasts) => set({ podcasts }),
      addPodcast: (podcast) =>
        set((state) => {
          if (state.podcasts.some((p) => p.id === podcast.id)) {
            return state; // Keeps duplicate podcasts from being added
          }
          return { podcasts: [...state.podcasts, podcast] };
        }),
      removePodcast: (podcastId) =>
        set((state) => ({
          podcasts: state.podcasts.filter((p) => p.id !== podcastId),
        })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: STORAGE_KEYS.PODCASTS,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ podcasts: state.podcasts }),
    },
  ),
);
