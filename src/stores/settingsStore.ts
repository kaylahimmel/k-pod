import { create } from "zustand";
import { AppSettings, SettingsStore } from "../models";

const defaultSettings: AppSettings = {
  autoPlayNext: true,
  defaultSpeed: 1,
  downloadOnWiFi: true,
  skipForwardSeconds: 30,
  skipBackwardSeconds: 15,
};

export const settingsStore = create<SettingsStore>((set) => ({
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
