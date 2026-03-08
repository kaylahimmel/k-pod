export type ThemePreference = 'system' | 'light' | 'dark';

export interface ThemeOption {
  value: ThemePreference;
  label: string;
}

export interface SpeedOption {
  value: number;
  label: string;
}

export interface SkipOption {
  value: number;
  label: string;
}

export interface FormattedSettings {
  autoPlayNext: boolean;
  defaultSpeed: number;
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
  handleSpeedChange: (speed: number) => void;
  handleToggleDownloadOnWiFi: () => void;
  handleSkipForwardChange: (seconds: number) => void;
  handleSkipBackwardChange: (seconds: number) => void;
  themePreference: ThemePreference;
  themeOptions: ThemeOption[];
  handleThemeChange: (theme: ThemePreference) => void;
  handleResetSettings: () => void;
  handlePrivacyPolicyPress: () => void;
  handleTermsOfServicePress: () => void;
}
