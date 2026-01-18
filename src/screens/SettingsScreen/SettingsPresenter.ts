import { AppSettings } from "../../models";
import { FormattedSettings, SpeedOption, SkipOption } from "./Settings.types";

/**
 * Available playback speed options
 */
export const SPEED_OPTIONS: SpeedOption[] = [
  { value: 0.5, label: "0.5x" },
  { value: 0.75, label: "0.75x" },
  { value: 1, label: "1x (Normal)" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" },
  { value: 1.75, label: "1.75x" },
  { value: 2, label: "2x" },
];

/**
 * Available skip forward duration options
 */
export const SKIP_FORWARD_OPTIONS: SkipOption[] = [
  { value: 10, label: "10 seconds" },
  { value: 15, label: "15 seconds" },
  { value: 30, label: "30 seconds" },
  { value: 45, label: "45 seconds" },
  { value: 60, label: "60 seconds" },
];

/**
 * Available skip backward duration options
 */
export const SKIP_BACKWARD_OPTIONS: SkipOption[] = [
  { value: 5, label: "5 seconds" },
  { value: 10, label: "10 seconds" },
  { value: 15, label: "15 seconds" },
  { value: 30, label: "30 seconds" },
];

/**
 * Formats playback speed for display
 * Example: 1 -> "1x (Normal)", 1.5 -> "1.5x"
 */
export function formatPlaybackSpeed(speed: number): string {
  const option = SPEED_OPTIONS.find((opt) => opt.value === speed);
  if (option) {
    return option.label;
  }
  return `${speed}x`;
}

/**
 * Formats skip duration in seconds to a display string
 * Example: 30 -> "30 sec"
 */
export function formatSkipDuration(seconds: number): string {
  return `${seconds} sec`;
}

/**
 * Formats app settings for display in the View
 */
export function formatSettings(settings: AppSettings): FormattedSettings {
  return {
    autoPlayNext: settings.autoPlayNext,
    defaultSpeed: settings.defaultSpeed,
    defaultSpeedLabel: formatPlaybackSpeed(settings.defaultSpeed),
    downloadOnWiFi: settings.downloadOnWiFi,
    skipForwardSeconds: settings.skipForwardSeconds,
    skipForwardLabel: formatSkipDuration(settings.skipForwardSeconds),
    skipBackwardSeconds: settings.skipBackwardSeconds,
    skipBackwardLabel: formatSkipDuration(settings.skipBackwardSeconds),
  };
}

/**
 * Gets the app version string
 * In a real app, this would come from app.json or Constants.expoConfig
 */
export function getAppVersion(): string {
  // TODO: Replace with actual version from expo-constants when needed
  return "1.0.0";
}
