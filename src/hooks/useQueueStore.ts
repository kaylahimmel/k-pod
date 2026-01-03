import queueStore from '../stores/queueStore';

/**
 * Hook to access the queue store
 * Returns the entire queue store state and actions
 */
export function useQueueStore() {
  return queueStore();
}