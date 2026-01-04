export interface AppSettings {
  autoPlayNext: boolean; // Whether to automatically play the next episode
  defaultSpeed: number; // Default playback speed (e.g., 1.0 for normal speed)
  downloadOnWiFi: boolean; // Whether to download episodes only on WiFi
  skipForwardSeconds: number; // Number of seconds to skip forward
  skipBackwardSeconds: number; // Number of seconds to skip backward
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
