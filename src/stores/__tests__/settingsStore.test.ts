import { settingsStore } from '../../stores';
import { AppSettings } from '../../models';

describe('settingsStore', () => {
  const defaultSettings: AppSettings = {
    autoPlayNext: true,
    defaultSpeed: 1,
    downloadOnWiFi: true,
    skipForwardSeconds: 30,
    skipBackwardSeconds: 15,
  };

  beforeEach(() => {
    // Reset store to initial state before each test
    settingsStore.setState({
      settings: defaultSettings,
      loading: false,
      error: null,
    });
  });

  describe('initial state', () => {
    it('should initialize with default settings', () => {
      const state = settingsStore.getState();
      expect(state.settings).toEqual(defaultSettings);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
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
      const newSettings: AppSettings = {
        autoPlayNext: false,
        defaultSpeed: 0.75,
        downloadOnWiFi: false,
        skipForwardSeconds: 45,
        skipBackwardSeconds: 10,
      };

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

  describe('setLoading', () => {
    it('should set loading state', () => {
      settingsStore.getState().setLoading(true);
      expect(settingsStore.getState().loading).toBe(true);

      settingsStore.getState().setLoading(false);
      expect(settingsStore.getState().loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      settingsStore.getState().setError('Failed to load settings');
      expect(settingsStore.getState().error).toBe('Failed to load settings');
    });

    it('should clear error message', () => {
      settingsStore.getState().setError('Some error');
      settingsStore.getState().setError(null);
      expect(settingsStore.getState().error).toBeNull();
    });
  });

  describe('complex scenarios', () => {
    it('should handle loading flow: loading -> success -> reset', () => {
      const state = settingsStore.getState();

      state.setLoading(true);
      expect(settingsStore.getState().loading).toBe(true);

      const newSettings: AppSettings = {
        autoPlayNext: false,
        defaultSpeed: 1.75,
        downloadOnWiFi: false,
        skipForwardSeconds: 45,
        skipBackwardSeconds: 20,
      };

      state.loadSettings(newSettings);
      state.setLoading(false);

      expect(settingsStore.getState().loading).toBe(false);
      expect(settingsStore.getState().settings).toEqual(newSettings);

      state.resetSettings();
      expect(settingsStore.getState().settings).toEqual(defaultSettings);
    });
  });
});
