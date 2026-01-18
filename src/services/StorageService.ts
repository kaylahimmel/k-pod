import AsyncStorage from '@react-native-async-storage/async-storage';
import { Podcast, QueueItem, AppSettings, ListeningHistory } from '../models';
import { STORAGE_KEYS } from '../constants';

/**
 * Save any JSON-serializable data to storage
 * @param key - Storage key
 * @param data - Data to save (will be JSON stringified)
 */
async function saveData<T>(key: string, data: T): Promise<void> {
  try {
    const jsonString = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonString);
  } catch (error) {
    console.error(`Error saving data for key "${key}":`, error);
    throw error;
  }
}

/**
 * Load data from storage
 * @param key - Storage key
 * @returns Parsed data or null if not found
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
    throw error;
  }
}

/**
 * Remove data from storage
 * @param key - Storage key
 */
async function removeData(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key "${key}":`, error);
    throw error;
  }
}

async function savePodcasts(podcasts: Podcast[]): Promise<void> {
  return saveData(STORAGE_KEYS.PODCASTS, podcasts);
}

async function loadPodcasts(): Promise<Podcast[]> {
  const data = await loadData<Podcast[]>(STORAGE_KEYS.PODCASTS);
  return data ?? [];
}

async function saveQueue(queue: QueueItem[]): Promise<void> {
  return saveData(STORAGE_KEYS.QUEUE, queue);
}

async function loadQueue(): Promise<QueueItem[]> {
  const data = await loadData<QueueItem[]>(STORAGE_KEYS.QUEUE);
  return data ?? [];
}

async function saveSettings(settings: AppSettings): Promise<void> {
  return saveData(STORAGE_KEYS.SETTINGS, settings);
}

async function loadSettings(): Promise<AppSettings | null> {
  return loadData<AppSettings>(STORAGE_KEYS.SETTINGS);
}

async function saveHistory(history: ListeningHistory[]): Promise<void> {
  return saveData(STORAGE_KEYS.HISTORY, history);
}

async function loadHistory(): Promise<ListeningHistory[]> {
  const data = await loadData<ListeningHistory[]>(STORAGE_KEYS.HISTORY);
  return data ?? [];
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

Yexport const StorageService = {
  saveData,
  loadData,
  removeData,
  savePodcasts,
  loadPodcasts,
  saveQueue,
  loadQueue,
  saveSettings,
  loadSettings,
  saveHistory,
  loadHistory,
  savePlaybackPosition,
  loadPlaybackPosition,
  removePlaybackPosition,
  clearAllData,
  STORAGE_KEYS,
};
