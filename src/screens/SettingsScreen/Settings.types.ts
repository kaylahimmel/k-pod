import { UseToastReturn } from '../../hooks';
import { SettingStat } from '../../components';
import { SettingsSubPage } from '../../navigation/types';

export interface FormattedAccount {
  email: string;
  initials: string;
}

export interface SettingsViewProps {
  // Opens a Settings sub-page. One prop for every row, so a new page needs a
  // row and a screen but no new prop
  onNavigate: (page: SettingsSubPage) => void;
}

export interface SettingsViewModelReturn {
  downloadOnWiFi: boolean;
  isDarkMode: boolean;
  account: FormattedAccount;
  listeningStats: SettingStat[];
  toast: UseToastReturn;
  handleToggleDownloadOnWiFi: () => void;
  handleToggleDarkMode: () => void;
  handleResetSettings: () => void;
  handleSignOutPress: () => void;
}
