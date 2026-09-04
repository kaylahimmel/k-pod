import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, SettingsStore } from '../models';
import { STORAGE_KEYS } from '../constants';

const defaultSettings: AppSettings = {
  autoPlayNext: true,
  defaultSpeed: 1,
  downloadOnWiFi: true,
  skipForwardSeconds: 30,
  skipBackwardSeconds: 15,
};

export const settingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
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
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      storage: createJSONStorage(() => AsyncStorage),
      // Persist only the user's settings; loading/error are transient UI state
      partialize: (state) => ({
        settings: state.settings,
      }),
    },
  ),
);
