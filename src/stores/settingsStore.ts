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
  newEpisodeNotifications: false,
  mutedNotificationPodcastIds: [],
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
      // persist's default merge is SHALLOW: the stored `settings` object
      // replaces the in-memory one wholesale. On an install that saved
      // settings before a field existed (e.g. newEpisodeNotifications), that
      // field would rehydrate as `undefined` instead of its default. Merging
      // the stored settings over defaultSettings fills in any missing fields.
      merge: (persistedState, currentState) => {
        const persisted = persistedState as
          | { settings?: Partial<AppSettings> }
          | undefined;
        return {
          ...currentState,
          settings: {
            ...defaultSettings,
            ...persisted?.settings,
          },
        };
      },
    },
  ),
);
