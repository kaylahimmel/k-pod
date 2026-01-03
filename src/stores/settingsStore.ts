import { create } from 'zustand';

import { AppSettings } from '../models/AppSettings';

interface SettingsStore {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  updateSettings: (settings: Partial<AppSettings>) => void; // Update multiple settings at once
  loadSettings: (settings: AppSettings) => void; // Load settings from storage
  resetSettings: () => void; // Reset to defaults
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultSettings: AppSettings = {
  autoPlayNext: true,
  defaultSpeed: 1,
  downloadOnWiFi: true,
  skipForwardSeconds: 30,
  skipBackwardSeconds: 15,
};

const settingsStore = create<SettingsStore>((set) => ({
  settings: defaultSettings,
  loading: false,
  error: null,
  updateSetting: (key, value) =>
    set((state) => ({
      settings: {
        ...state.settings,
        [key]: value,
      },
    })),
  updateSettings: (updates) =>
    set((state) => ({
      settings: {
        ...state.settings,
        ...updates,
      },
    })),
  loadSettings: (settings) => set({ settings }),
  resetSettings: () => set({ settings: defaultSettings }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export default settingsStore;
