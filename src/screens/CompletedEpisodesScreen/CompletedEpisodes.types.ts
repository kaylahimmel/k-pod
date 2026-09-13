import { FormattedHistoryItem } from '../../models';
import { UseToastReturn } from '../../hooks';

export interface CompletedEpisodesViewProps {
  podcastId: string;
}

export interface CompletedEpisodesViewModelReturn {
  episodes: FormattedHistoryItem[];
  isLoading: boolean;
  isEmpty: boolean;
  summary: string;
  // Index of the episode whose action menu is open, or null when closed
  menuIndex: number | null;
  menuEpisodeTitle: string;
  toast: UseToastReturn;
  handleOpenMenu: (index: number) => void;
  handleCloseMenu: () => void;
  handleAddToQueue: () => void;
  handleShare: () => void;
}
