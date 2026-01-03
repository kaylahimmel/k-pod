import { create } from 'zustand';
import { PodcastStore } from '../models';

export const podcastStore = create<PodcastStore>((set) => ({
  podcasts: [],
  loading: false,
  error: null,
  setPodcasts: (podcasts) => set({ podcasts }),
  addPodcast: (podcast) => set((state) => {
    if (state.podcasts.some((p) => p.id === podcast.id)) {
      return state; // Keeps duplicate podcasts from being added
    }
    return { podcasts: [...state.podcasts, podcast] };
  }),
  removePodcast: (podcastId) => set((state) => ({
    podcasts: state.podcasts.filter((p) => p.id !== podcastId)
  })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
