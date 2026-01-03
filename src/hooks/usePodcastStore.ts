import podcastStore from '../stores/podcastStore';

/**
 * Hook to access the podcast store
 * Returns the entire podcast store state and actions
 */
export function usePodcastStore() {
  return podcastStore();
}