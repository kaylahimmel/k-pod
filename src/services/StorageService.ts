import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

// Note: queue, podcast, and settings persistence is owned by the zustand
// `persist` middleware (see src/stores) - do NOT add StorageService
// functions for those keys, they would corrupt the persisted envelopes

/**
 * Save any JSON-serializable data to storage
 * Storage failures are logged but never rethrown: callers fire-and-forget
 * these (e.g. position saves on the progress tick), so a rethrow would
 * become an unhandled promise rejection
 * @param key - Storage key
 * @param data - Data to save (will be JSON stringified)
 */
async function saveData<T>(key: string, data: T): Promise<void> {
  try {
    const jsonString = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonString);
  } catch (error) {
    console.error(`Error saving data for key "${key}":`, error);
  }
}

/**
 * Load data from storage
 * @param key - Storage key
 * @returns Parsed data, or null if not found or on storage failure
 */
async function loadData<T>(key: string): Promise<T | null> {
  try {
    const jsonString = await AsyncStorage.getItem(key);
    if (jsonString === null) {
      return null;
    }
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error(`Error loading data for key "${key}":`, error);
    return null;
  }
}

/**
 * Remove data from storage
 * Failures are logged but never rethrown (see saveData)
 * @param key - Storage key
 */
async function removeData(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key "${key}":`, error);
  }
}

async function savePlaybackPosition(
  episodeId: string,
  position: number,
): Promise<void> {
  const key = `${STORAGE_KEYS.PLAYBACK_POSITION_PREFIX}${episodeId}`;
  return saveData(key, position);
}

async function loadPlaybackPosition(episodeId: string): Promise<number> {
  const key = `${STORAGE_KEYS.PLAYBACK_POSITION_PREFIX}${episodeId}`;
  const data = await loadData<number>(key);
  return data ?? 0;
}

async function removePlaybackPosition(episodeId: string): Promise<void> {
  const key = `${STORAGE_KEYS.PLAYBACK_POSITION_PREFIX}${episodeId}`;
  return removeData(key);
}

/**
 * Clear all app data from storage
 * Useful for logout or reset functionality
 */
async function clearAllData(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const appKeys = keys.filter((key) => key.startsWith('@k-pod/'));
  await AsyncStorage.multiRemove(appKeys);
}

export const StorageService = {
  saveData,
  loadData,
  removeData,
  savePlaybackPosition,
  loadPlaybackPosition,
  removePlaybackPosition,
  clearAllData,
  STORAGE_KEYS,
};
