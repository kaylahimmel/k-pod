import { playerStore } from '../stores';

/**
 * Hook to access the player store
 * Returns the entire player store state and actions
 */
export function usePlayerStore() {
  return playerStore();
}
