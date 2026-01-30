import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Episode, PodcastStore } from '../models';
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
      updatePodcastEpisodes: (podcastId: string, newEpisodes: Episode[]) =>
        set((state) => {
          const podcastIndex = state.podcasts.findIndex(
            (p) => p.id === podcastId,
          );
          if (podcastIndex === -1) return state;

          const existingPodcast = state.podcasts[podcastIndex];
          // Create a map of existing episodes to preserve played state
          const existingEpisodesMap = new Map(
            existingPodcast.episodes.map((ep) => [ep.id, ep]),
          );

          // Merge new episodes with existing ones, preserving played state
          const mergedEpisodes = newEpisodes.map((newEp) => {
            const existingEp = existingEpisodesMap.get(newEp.id);
            if (existingEp) {
              // Preserve played state from existing episode
              return { ...newEp, played: existingEp.played };
            }
            return newEp;
          });

          const updatedPodcasts = [...state.podcasts];
          updatedPodcasts[podcastIndex] = {
            ...existingPodcast,
            episodes: mergedEpisodes,
            lastUpdated: new Date().toISOString(),
          };

          return { podcasts: updatedPodcasts };
        }),
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
