export interface AppSettings {
  autoPlayNext: boolean; // Whether to automatically play the next episode
  defaultSpeed: number; // Default playback speed (e.g., 1.0 for normal speed)
  downloadOnWiFi: boolean; // Whether to download episodes only on WiFi
  skipForwardSeconds: number; // Number of seconds to skip forward
  skipBackwardSeconds: number; // Number of seconds to skip backward
}
