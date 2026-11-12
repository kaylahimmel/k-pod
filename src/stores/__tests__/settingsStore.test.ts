import AsyncStorage from '@react-native-async-storage/async-storage';
import { settingsStore } from '../../stores';
import { AppSettings } from '../../models';
import { STORAGE_KEYS } from '../../constants';
import { createMockAppSettings } from '../../__mocks__';

describe('settingsStore', () => {
  const defaultSettings: AppSettings = {
    autoPlayNext: true,
    defaultSpeed: 1,
    downloadOnWiFi: true,
    skipForwardSeconds: 30,
    skipBackwardSeconds: 15,
    newEpisodeNotifications: false,
    mutedNotificationPodcastIds: [],
    themePreference: 'system',
  };

  beforeEach(() => {
    // Reset store to initial state before each test
    settingsStore.setState({
      settings: defaultSettings,
    });
  });

  describe('initial state', () => {
    it('should initialize with default settings', () => {
      const state = settingsStore.getState();
      expect(state.settings).toEqual(defaultSettings);
    });
  });

  describe('updateSetting', () => {
    it('should update a single setting', () => {
      settingsStore.getState().updateSetting('defaultSpeed', 1.5);

      const state = settingsStore.getState();
      expect(state.settings.defaultSpeed).toBe(1.5);
      expect(state.settings.autoPlayNext).toBe(true); // Other settings unchanged
    });

    it('should update boolean settings', () => {
      settingsStore.getState().updateSetting('autoPlayNext', false);

      expect(settingsStore.getState().settings.autoPlayNext).toBe(false);
    });

    it('should update numeric settings', () => {
      settingsStore.getState().updateSetting('skipForwardSeconds', 45);
      settingsStore.getState().updateSetting('skipBackwardSeconds', 10);

      const state = settingsStore.getState();
      expect(state.settings.skipForwardSeconds).toBe(45);
      expect(state.settings.skipBackwardSeconds).toBe(10);
    });

    it('should preserve other settings when updating one', () => {
      const originalSettings = { ...settingsStore.getState().settings };

      settingsStore.getState().updateSetting('downloadOnWiFi', false);

      const state = settingsStore.getState();
      expect(state.settings.autoPlayNext).toBe(originalSettings.autoPlayNext);
      expect(state.settings.defaultSpeed).toBe(originalSettings.defaultSpeed);
      expect(state.settings.skipForwardSeconds).toBe(
        originalSettings.skipForwardSeconds,
      );
      expect(state.settings.skipBackwardSeconds).toBe(
        originalSettings.skipBackwardSeconds,
      );
      expect(state.settings.downloadOnWiFi).toBe(false);
    });
  });

  describe('updateSettings', () => {
    it('should update multiple settings at once', () => {
      const updates: Partial<AppSettings> = {
        autoPlayNext: false,
        defaultSpeed: 2,
        skipForwardSeconds: 60,
      };

      settingsStore.getState().updateSettings(updates);

      const state = settingsStore.getState();
      expect(state.settings.autoPlayNext).toBe(false);
      expect(state.settings.defaultSpeed).toBe(2);
      expect(state.settings.skipForwardSeconds).toBe(60);
      expect(state.settings.downloadOnWiFi).toBe(true); // Unchanged
      expect(state.settings.skipBackwardSeconds).toBe(15); // Unchanged
    });

    it('should handle partial updates', () => {
      settingsStore.getState().updateSettings({
        defaultSpeed: 0.75,
      });

      const state = settingsStore.getState();
      expect(state.settings.defaultSpeed).toBe(0.75);
      expect(state.settings.autoPlayNext).toBe(defaultSettings.autoPlayNext);
    });

    it('should merge with existing settings', () => {
      settingsStore.getState().updateSettings({
        autoPlayNext: false,
      });

      settingsStore.getState().updateSettings({
        defaultSpeed: 1.25,
      });

      const state = settingsStore.getState();
      expect(state.settings.autoPlayNext).toBe(false);
      expect(state.settings.defaultSpeed).toBe(1.25);
    });
  });

  describe('loadSettings', () => {
    it('should load and replace entire settings object', () => {
      const newSettings: AppSettings = createMockAppSettings({
        autoPlayNext: false,
        defaultSpeed: 0.75,
        downloadOnWiFi: false,
        skipForwardSeconds: 45,
        skipBackwardSeconds: 10,
      });

      settingsStore.getState().loadSettings(newSettings);

      expect(settingsStore.getState().settings).toEqual(newSettings);
    });

    it('should completely replace previous settings', () => {
      settingsStore.getState().updateSetting('autoPlayNext', false);

      const newSettings: AppSettings = {
        autoPlayNext: true, // Reset to default
        defaultSpeed: 1.5,
        downloadOnWiFi: true,
        skipForwardSeconds: 30,
        skipBackwardSeconds: 15,
        newEpisodeNotifications: false,
        mutedNotificationPodcastIds: [],
        themePreference: 'system',
      };

      settingsStore.getState().loadSettings(newSettings);

      expect(settingsStore.getState().settings).toEqual(newSettings);
    });
  });

  describe('resetSettings', () => {
    it('should reset settings to defaults', () => {
      // Change all settings
      settingsStore.getState().updateSettings({
        autoPlayNext: false,
        defaultSpeed: 2,
        downloadOnWiFi: false,
        skipForwardSeconds: 60,
        skipBackwardSeconds: 30,
      });

      // Verify they changed
      let state = settingsStore.getState();
      expect(state.settings).not.toEqual(defaultSettings);

      // Reset
      settingsStore.getState().resetSettings();

      state = settingsStore.getState();
      expect(state.settings).toEqual(defaultSettings);
    });
  });

  describe('themePreference', () => {
    it('should follow the phone by default', () => {
      expect(settingsStore.getState().settings.themePreference).toBe('system');
    });

    it('should go back to following the phone after a reset', () => {
      settingsStore.getState().updateSetting('themePreference', 'dark');

      settingsStore.getState().resetSettings();

      expect(settingsStore.getState().settings.themePreference).toBe('system');
    });

    it('should keep a saved light choice across a restart', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({
          state: { settings: { ...defaultSettings, themePreference: 'light' } },
          version: 0,
        }),
      );

      await settingsStore.persist.rehydrate();

      expect(settingsStore.getState().settings.themePreference).toBe('light');
    });
  });

  describe('complex scenarios', () => {
    it('should load saved settings, then reset to defaults', () => {
      const state = settingsStore.getState();

      const newSettings: AppSettings = createMockAppSettings({
        autoPlayNext: false,
        defaultSpeed: 1.75,
        downloadOnWiFi: false,
        skipForwardSeconds: 45,
        skipBackwardSeconds: 20,
      });

      state.loadSettings(newSettings);

      expect(settingsStore.getState().settings).toEqual(newSettings);

      state.resetSettings();
      expect(settingsStore.getState().settings).toEqual(defaultSettings);
    });
  });

  describe('persistence', () => {
    it('should persist settings to AsyncStorage under the settings key', () => {
      // Settings previously reset on every app restart because the store
      // lacked the persist middleware the queue/podcast stores have
      const options = settingsStore.persist.getOptions();

      expect(options.name).toBe(STORAGE_KEYS.SETTINGS);
    });

    it('should persist only the settings object, not the action functions', () => {
      const options = settingsStore.persist.getOptions();
      const partialized = options.partialize?.(settingsStore.getState());

      expect(partialized).toEqual({
        settings: settingsStore.getState().settings,
      });
    });

    it('should fill in defaults for fields missing from older persisted settings', async () => {
      // An install that saved settings before the notification fields
      // existed. persist's default shallow merge would leave them undefined.
      const legacySettings = {
        autoPlayNext: false,
        defaultSpeed: 1.5,
        downloadOnWiFi: false,
        skipForwardSeconds: 45,
        skipBackwardSeconds: 10,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ state: { settings: legacySettings }, version: 0 }),
      );

      await settingsStore.persist.rehydrate();

      expect(settingsStore.getState().settings).toEqual({
        ...legacySettings,
        newEpisodeNotifications: false,
        mutedNotificationPodcastIds: [],
        themePreference: 'system',
      });
    });

    it('should keep persisted values over defaults when merging', () => {
      const options = settingsStore.persist.getOptions();
      const merged = options.merge?.(
        {
          settings: {
            newEpisodeNotifications: true,
            mutedNotificationPodcastIds: ['podcast-1'],
          },
        },
        settingsStore.getState(),
      );

      expect(merged?.settings.newEpisodeNotifications).toBe(true);
      expect(merged?.settings.mutedNotificationPodcastIds).toEqual([
        'podcast-1',
      ]);
      expect(merged?.settings.skipForwardSeconds).toBe(30);
    });

    it('should fall back to defaults when nothing is persisted', () => {
      const options = settingsStore.persist.getOptions();
      const merged = options.merge?.(undefined, settingsStore.getState());

      expect(merged?.settings).toEqual(defaultSettings);
    });
  });
});
