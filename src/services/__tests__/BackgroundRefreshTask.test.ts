import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import {
  BACKGROUND_REFRESH_TASK,
  runBackgroundRefresh,
  registerBackgroundRefresh,
  unregisterBackgroundRefresh,
} from '../BackgroundRefreshTask';
import { RefreshService } from '../RefreshService';
import { NotificationService } from '../NotificationService';
import { podcastStore, settingsStore } from '../../stores';
import { createMockAppSettings } from '../../__mocks__';

jest.mock('../RefreshService', () => ({
  RefreshService: { refreshAllPodcasts: jest.fn() },
}));

jest.mock('../NotificationService', () => ({
  NotificationService: { notifyNewEpisodes: jest.fn() },
}));

const refreshAll = RefreshService.refreshAllPodcasts as jest.Mock;
const notify = NotificationService.notifyNewEpisodes as jest.Mock;

const refreshOutput = {
  totalPodcasts: 1,
  successCount: 1,
  failCount: 0,
  totalNewEpisodes: 1,
  results: [],
};

describe('BackgroundRefreshTask', () => {
  // defineTask runs once at import; capture it before clearAllMocks wipes it
  const defineTaskCalls = (
    TaskManager.defineTask as jest.Mock
  ).mock.calls.slice();

  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    settingsStore.setState({
      settings: createMockAppSettings({ newEpisodeNotifications: true }),
    });
    refreshAll.mockResolvedValue(refreshOutput);
    notify.mockResolvedValue({ success: true, data: 1 });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('defines the task at module load', () => {
    expect(defineTaskCalls).toEqual([
      [BACKGROUND_REFRESH_TASK, runBackgroundRefresh],
    ]);
  });

  describe('runBackgroundRefresh', () => {
    it('waits for both stores to hydrate before refreshing', async () => {
      const order: string[] = [];
      jest.spyOn(podcastStore.persist, 'hasHydrated').mockReturnValue(false);
      jest.spyOn(settingsStore.persist, 'hasHydrated').mockReturnValue(false);
      jest
        .spyOn(podcastStore.persist, 'rehydrate')
        .mockImplementation(async () => {
          order.push('podcasts hydrated');
        });
      jest
        .spyOn(settingsStore.persist, 'rehydrate')
        .mockImplementation(async () => {
          order.push('settings hydrated');
        });
      refreshAll.mockImplementation(async () => {
        order.push('refresh');
        return refreshOutput;
      });

      await runBackgroundRefresh();

      expect(order).toEqual([
        'podcasts hydrated',
        'settings hydrated',
        'refresh',
      ]);
    });

    it('skips rehydrating stores that are already hydrated', async () => {
      jest.spyOn(podcastStore.persist, 'hasHydrated').mockReturnValue(true);
      jest.spyOn(settingsStore.persist, 'hasHydrated').mockReturnValue(true);
      const podcastRehydrate = jest.spyOn(podcastStore.persist, 'rehydrate');
      const settingsRehydrate = jest.spyOn(settingsStore.persist, 'rehydrate');

      await runBackgroundRefresh();

      expect(podcastRehydrate).not.toHaveBeenCalled();
      expect(settingsRehydrate).not.toHaveBeenCalled();
    });

    it('bails without refreshing when the master toggle is off', async () => {
      jest.spyOn(settingsStore.persist, 'hasHydrated').mockReturnValue(true);
      jest.spyOn(podcastStore.persist, 'hasHydrated').mockReturnValue(true);
      settingsStore.setState({
        settings: createMockAppSettings({ newEpisodeNotifications: false }),
      });

      const result = await runBackgroundRefresh();

      expect(result).toBe(BackgroundTask.BackgroundTaskResult.Success);
      expect(refreshAll).not.toHaveBeenCalled();
      expect(notify).not.toHaveBeenCalled();
    });

    it('refreshes and notifies with the current settings', async () => {
      jest.spyOn(settingsStore.persist, 'hasHydrated').mockReturnValue(true);
      jest.spyOn(podcastStore.persist, 'hasHydrated').mockReturnValue(true);

      const result = await runBackgroundRefresh();

      expect(result).toBe(BackgroundTask.BackgroundTaskResult.Success);
      expect(notify).toHaveBeenCalledWith(
        refreshOutput.results,
        settingsStore.getState().settings,
      );
    });

    it('returns Failed when notifying fails', async () => {
      jest.spyOn(settingsStore.persist, 'hasHydrated').mockReturnValue(true);
      jest.spyOn(podcastStore.persist, 'hasHydrated').mockReturnValue(true);
      notify.mockResolvedValue({ success: false, error: 'denied' });

      const result = await runBackgroundRefresh();

      expect(result).toBe(BackgroundTask.BackgroundTaskResult.Failed);
    });

    it('returns Failed when the refresh throws', async () => {
      jest.spyOn(settingsStore.persist, 'hasHydrated').mockReturnValue(true);
      jest.spyOn(podcastStore.persist, 'hasHydrated').mockReturnValue(true);
      refreshAll.mockRejectedValue(new Error('offline'));

      const result = await runBackgroundRefresh();

      expect(result).toBe(BackgroundTask.BackgroundTaskResult.Failed);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('registerBackgroundRefresh', () => {
    it('registers the task with a 15 minute minimum interval', async () => {
      const result = await registerBackgroundRefresh();

      expect(result.success).toBe(true);
      expect(BackgroundTask.registerTaskAsync).toHaveBeenCalledWith(
        BACKGROUND_REFRESH_TASK,
        { minimumInterval: 15 },
      );
    });

    it('fails without registering when background tasks are restricted', async () => {
      (BackgroundTask.getStatusAsync as jest.Mock).mockResolvedValueOnce(
        BackgroundTask.BackgroundTaskStatus.Restricted,
      );

      const result = await registerBackgroundRefresh();

      expect(result.success).toBe(false);
      expect(BackgroundTask.registerTaskAsync).not.toHaveBeenCalled();
    });

    it('returns a failure result when registration throws', async () => {
      (BackgroundTask.registerTaskAsync as jest.Mock).mockRejectedValueOnce(
        new Error('nope'),
      );

      const result = await registerBackgroundRefresh();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('nope');
      }
    });
  });

  describe('unregisterBackgroundRefresh', () => {
    it('unregisters a registered task', async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValueOnce(
        true,
      );

      const result = await unregisterBackgroundRefresh();

      expect(result.success).toBe(true);
      expect(BackgroundTask.unregisterTaskAsync).toHaveBeenCalledWith(
        BACKGROUND_REFRESH_TASK,
      );
    });

    it('does nothing when the task is not registered', async () => {
      const result = await unregisterBackgroundRefresh();

      expect(result.success).toBe(true);
      expect(BackgroundTask.unregisterTaskAsync).not.toHaveBeenCalled();
    });

    it('returns a failure result when unregistering throws', async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockRejectedValueOnce(
        new Error('broken'),
      );

      const result = await unregisterBackgroundRefresh();

      expect(result.success).toBe(false);
    });
  });
});
