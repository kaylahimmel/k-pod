import { PlaybackSpeed } from './Playback.types';

// 'system' follows the phone's light/dark setting. The in-app Dark Mode switch
// saves 'dark' or 'light', which stays until it's switched again or the user
// taps Reset All Settings (back to 'system')
export type ThemePreference = 'system' | 'light' | 'dark';

export interface AppSettings {
  autoPlayNext: boolean; // Whether to automatically play the next episode
  defaultSpeed: PlaybackSpeed; // Default playback speed (e.g., 1 for normal speed)
  downloadOnWiFi: boolean; // Whether to download episodes only on WiFi
  skipForwardSeconds: number; // Number of seconds to skip forward
  skipBackwardSeconds: number; // Number of seconds to skip backward
  newEpisodeNotifications: boolean; // Master switch for new-episode alerts (off until the user opts in)
  mutedNotificationPodcastIds: string[]; // podcast.id values the user opted out of; new subscriptions notify by default
  themePreference: ThemePreference; // Light/dark choice; 'system' until the user flips the Dark Mode switch
}

export interface SettingsStore {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  updateSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => void;
  updateSettings: (settings: Partial<AppSettings>) => void; // Update multiple settings at once
  loadSettings: (settings: AppSettings) => void; // Load settings from storage
  resetSettings: () => void; // Reset to defaults
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
