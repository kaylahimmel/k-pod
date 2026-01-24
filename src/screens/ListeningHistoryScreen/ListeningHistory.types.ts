import { FormattedHistoryItem } from '../ProfileScreen/Profile.types';

export interface ListeningHistoryViewProps {
  onClearHistory: () => void;
}

export interface ListeningHistoryViewModelReturn {
  history: FormattedHistoryItem[];
  isLoading: boolean;
  isEmpty: boolean;
  historySummary: string;
  handleClearHistory: () => void;
}
