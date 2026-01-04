import { podcastStore } from "../stores";

/**
 * Hook to access the podcast store
 * Returns the entire podcast store state and actions
 */
export function usePodcastStore() {
  return podcastStore();
}
