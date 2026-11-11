import { UseToastReturn } from '../../hooks';

export interface FormattedAccount {
  email: string;
  initials: string;
}

export interface ListeningStats {
  totalListeningTime: string;
  episodesCompleted: number;
  podcastsSubscribed: number;
}

export interface SettingsViewProps {
  onNotificationsPress: () => void;
  onPlayerControlsPress: () => void;
  onLegalPress: () => void;
  onAppInfoPress: () => void;
  onListeningHistoryPress: () => void;
  onChangePasswordPress: () => void;
}

export interface SettingsViewModelReturn {
  downloadOnWiFi: boolean;
  isLoading: boolean;
  isDarkMode: boolean;
  account: FormattedAccount;
  listeningStats: ListeningStats;
  toast: UseToastReturn;
  handleToggleDownloadOnWiFi: () => void;
  handleToggleDarkMode: () => void;
  handleResetSettings: () => void;
  handleSignOutPress: () => void;
}
