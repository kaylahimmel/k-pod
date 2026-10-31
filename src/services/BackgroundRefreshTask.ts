import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { podcastStore, settingsStore } from '../stores';
import { ServiceResult } from '../models';
import { RefreshService } from './RefreshService';
import { NotificationService } from './NotificationService';

export const BACKGROUND_REFRESH_TASK = 'k-pod-background-refresh';

// expo-background-task takes MINUTES (the old expo-background-fetch took
// seconds). 15 is the OS minimum; the OS treats it as "no sooner than",
// not a schedule.
const MINIMUM_INTERVAL_MINUTES = 15;

/** The slice of zustand's persist API this file needs */
interface PersistApi {
  hasHydrated: () => boolean;
  rehydrate: () => Promise<void> | void;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

/**
 * Waits for a persisted store to load from AsyncStorage.
 *
 * When the OS launches the app headlessly for a background task, no screen
 * mounts, and the stores may still be empty when the task starts. Refreshing
 * then would see zero podcasts, and any store write would overwrite the
 * user's saved data with that empty state (the same bug historyStore once
 * had). `rehydrate()` resolves once loading finishes, including on failure.
 */
async function ensureHydrated(persist: PersistApi): Promise<void> {
  if (persist.hasHydrated()) return;
  await persist.rehydrate();
}

/**
 * The background task body: load stores, refresh feeds, notify.
 * Exported separately from defineTask so it can be tested directly.
 */
export async function runBackgroundRefresh(): Promise<BackgroundTask.BackgroundTaskResult> {
  try {
    await Promise.all([
      ensureHydrated(podcastStore.persist),
      ensureHydrated(settingsStore.persist),
    ]);

    // Master toggle off: don't spend the user's battery/data on a refresh
    if (!settingsStore.getState().settings.newEpisodeNotifications) {
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    const refresh = await RefreshService.refreshAllPodcasts();

    // Read settings after the refresh so a mute made meanwhile is respected
    const notify = await NotificationService.notifyNewEpisodes(
      refresh.results,
      settingsStore.getState().settings,
    );

    if (!notify.success) {
      console.error('Background refresh notify failed:', notify.error);
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.error('Background refresh failed:', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
}

// Must run at module scope, not inside a component: the OS can start the JS
// runtime just to run this task, without ever mounting React. The root
// index.ts imports this file so the task is defined on every launch.
TaskManager.defineTask(BACKGROUND_REFRESH_TASK, runBackgroundRefresh);

/**
 * Asks the OS to run the refresh task periodically (at most every 15 min).
 * The registration survives app restarts until unregistered.
 */
export async function registerBackgroundRefresh(): Promise<
  ServiceResult<void>
> {
  try {
    const status = await BackgroundTask.getStatusAsync();
    if (status === BackgroundTask.BackgroundTaskStatus.Restricted) {
      return {
        success: false,
        error: 'Background refresh is not available on this device.',
      };
    }

    await BackgroundTask.registerTaskAsync(BACKGROUND_REFRESH_TASK, {
      minimumInterval: MINIMUM_INTERVAL_MINUTES,
    });
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: `Failed to register background refresh: ${getErrorMessage(error)}`,
    };
  }
}

/** Stops the periodic refresh task. Safe to call when it isn't registered. */
export async function unregisterBackgroundRefresh(): Promise<
  ServiceResult<void>
> {
  try {
    if (await TaskManager.isTaskRegisteredAsync(BACKGROUND_REFRESH_TASK)) {
      await BackgroundTask.unregisterTaskAsync(BACKGROUND_REFRESH_TASK);
    }
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: `Failed to unregister background refresh: ${getErrorMessage(error)}`,
    };
  }
}
