import playerStore from '../stores/playerStore';

/**
 * Hook to access the player store
 * Returns the entire player store state and actions
 */
export function usePlayerStore() {
  return playerStore();
}
