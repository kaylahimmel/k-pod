export interface ProfileViewProps {
  onViewHistoryPress: () => void;
  onChangePasswordPress: () => void;
  onSignOutPress: () => void;
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
  theme: "light" | "dark";
  notificationsEnabled: boolean;
}

export type ProfileViewModelReturn = {
  user: FormattedUser | null;
  recentHistory: FormattedHistoryItem[];
  stats: ProfileStats;
  isLoading: boolean;
  hasHistory: boolean;
  handleViewHistoryPress: () => void;
  handleChangePasswordPress: () => void;
  handleSignOutPress: () => void;
};
