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
}

export interface SettingsViewModelReturn {
  settings: FormattedSettings;
  isLoading: boolean;
  speedOptions: SpeedOption[];
  skipForwardOptions: SkipOption[];
  skipBackwardOptions: SkipOption[];
  appVersion: string;
  handleToggleAutoPlayNext: () => void;
  handleSpeedChange: (speed: PlaybackSpeed) => void;
  handleToggleDownloadOnWiFi: () => void;
  handleSkipForwardChange: (seconds: number) => void;
  handleSkipBackwardChange: (seconds: number) => void;
  handleResetSettings: () => void;
  handlePrivacyPolicyPress: () => void;
  handleTermsOfServicePress: () => void;
}
