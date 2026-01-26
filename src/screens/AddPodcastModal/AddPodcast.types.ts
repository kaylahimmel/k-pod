import { Podcast } from '../../models';

export type AddPodcastModalState = 'idle' | 'loading' | 'preview' | 'error';

export interface AddPodcastViewProps {
  onDismiss: () => void;
  onGoToDiscover: () => void;
}

export interface AddPodcastViewModelReturn {
  url: string;
  modalState: AddPodcastModalState;
  errorMessage: string | null;
  previewPodcast: Podcast | null;
  isAlreadySubscribed: boolean;
  handleUrlChange: (text: string) => void;
  handleFetchPodcast: () => Promise<void>;
  handleSubscribe: () => void;
  handleClearPreview: () => void;
  handleDiscoverPodcastPress: () => void;
}

export interface URLValidationResult {
  isValid: boolean;
  error: string | null;
}

export interface PodcastPreviewData {
  title: string;
  author: string;
  description: string;
  artworkUrl: string;
  episodeCount: number;
  latestEpisodeDate: string;
}
