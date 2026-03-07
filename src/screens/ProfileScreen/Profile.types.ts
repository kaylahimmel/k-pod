export interface ProfileViewProps {
  onViewHistoryPress: () => void;
  onChangePasswordPress: () => void;
}

export interface FormattedHistoryItem {
  id: string;
  episodeTitle: string;
  displayTitle: string;
  podcastTitle: string;
  podcastArtworkUrl: string;
  completedAt: string;
  formattedCompletedAt: string;
  completionPercentage: number;
  formattedCompletionPercentage: string;
}

export interface ProfileStats {
  totalListeningTime: string;
  episodesCompleted: number;
  episodesCompletedLabel: string;
  podcastsSubscribed: number;
  podcastsSubscribedLabel: string;
}

export interface FormattedUser {
  id: string;
  email: string;
  displayEmail: string;
  initials: string;
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
}

export type ProfileViewModelReturn = {
  user: FormattedUser | null;
  stats: ProfileStats;
  isLoading: boolean;
  handleViewHistoryPress: () => void;
  handleChangePasswordPress: () => void;
  handleSignOutPress: () => void; // Owned entirely by the ViewModel: shows confirmation alert and calls AuthService.signOut()
};
