import { settingsStore } from '../stores';

/**
 * Hook to access the settings store
 * Returns the entire settings store state and actions
 */
export function useSettingsStore() {
  return settingsStore();
}
