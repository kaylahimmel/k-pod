import { PlaybackSpeed } from '../../models';

export interface SpeedOption {
  value: PlaybackSpeed;
  label: string;
}

export interface SkipOption {
  value: number;
  label: string;
}

export interface FormattedSettings {
  autoPlayNext: boolean;
  defaultSpeed: PlaybackSpeed;
  defaultSpeedLabel: string;
  downloadOnWiFi: boolean;
  skipForwardSeconds: number;
  skipForwardLabel: string;
  skipBackwardSeconds: number;
  skipBackwardLabel: string;
  newEpisodeNotifications: boolean;
}

/** One row in the per-podcast notification list */
export interface NotificationPodcast {
  id: string;
  title: string;
  enabled: boolean; // false when the podcast is in mutedNotificationPodcastIds
}

export interface SettingsViewModelReturn {
  settings: FormattedSettings;
  isLoading: boolean;
  speedOptions: SpeedOption[];
  skipForwardOptions: SkipOption[];
  skipBackwardOptions: SkipOption[];
  appVersion: string;
  notificationPodcasts: NotificationPodcast[];
  handleToggleAutoPlayNext: () => void;
  handleSpeedChange: (speed: PlaybackSpeed) => void;
  handleToggleDownloadOnWiFi: () => void;
  handleSkipForwardChange: (seconds: number) => void;
  handleSkipBackwardChange: (seconds: number) => void;
  handleToggleNotifications: () => Promise<void>;
  handleTogglePodcastNotifications: (podcastId: string) => void;
  handleResetSettings: () => void;
  handlePrivacyPolicyPress: () => void;
  handleTermsOfServicePress: () => void;
}
