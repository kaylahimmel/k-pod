import { create } from 'zustand';

import { Podcast } from '../models/Podcast';

interface PodcastStore {
  podcasts: Podcast[];
  loading: boolean;
  error: string | null;
  setPodcasts: (podcasts: Podcast[]) => void; // update entire podcast list on intial fetch or refresh)
  addPodcast: (podcast: Podcast) => void; // append single podcast to list when a new one is available
  removePodcast: (podcastId: string) => void; // Remove specific podcast library when user unsubscribes
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const podcastStore = create<PodcastStore>((set) => ({
  podcasts: [],
  loading: false,
  error: null,
  setPodcasts: (podcasts) => set({ podcasts }),
  addPodcast: (podcast) => set((state) => ({ podcasts: [...state.podcasts, podcast] })),
  removePodcast: (podcastId) => set((state) => ({
    podcasts: state.podcasts.filter((p) => p.id !== podcastId)
  })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
