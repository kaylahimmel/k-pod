import { useState, useCallback, useMemo } from 'react';
import { usePodcastStore } from '../../hooks';
import { Podcast } from '../../models';
import { RSSService } from '../../services';
import {
  AddPodcastModalState,
  AddPodcastViewModelReturn,
} from './AddPodcast.types';
import {
  validateRSSUrl,
  normalizeUrl,
  formatErrorMessage,
} from './AddPodcastPresenter';

/**
 * ViewModel hook for the Add Podcast Modal
 * Manages RSS URL input, fetching, preview, and subscription
 */
export const useAddPodcastViewModel = (
  onDismiss: () => void,
  onGoToDiscover: () => void,
): AddPodcastViewModelReturn => {
  // Local state
  const [url, setUrl] = useState('');
  const [modalState, setModalState] = useState<AddPodcastModalState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewPodcast, setPreviewPodcast] = useState<Podcast | null>(null);

  // Store connection
  const { podcasts, addPodcast } = usePodcastStore();

  // Check if the previewed podcast is already subscribed
  const isAlreadySubscribed = useMemo(() => {
    if (!previewPodcast) return false;
    return podcasts.some((p) => p.id === previewPodcast.id);
  }, [previewPodcast, podcasts]);

  // Handle URL text input changes
  const handleUrlChange = useCallback((text: string) => {
    setUrl(text);
    // Clear any previous error when user starts typing
    if (text.length > 0) {
      setErrorMessage(null);
      setModalState('idle');
    }
  }, []);

  // Fetch podcast from RSS URL
  const handleFetchPodcast = useCallback(async () => {
    // Validate URL first
    const validation = validateRSSUrl(url);
    if (!validation.isValid) {
      setErrorMessage(validation.error);
      setModalState('error');
      return;
    }

    // Normalize and fetch
    const normalizedUrl = normalizeUrl(url);
    setModalState('loading');
    setErrorMessage(null);

    const result = await RSSService.transformPodcastFromRSS(normalizedUrl);

    if (result.success) {
      setPreviewPodcast(result.data);
      setModalState('preview');
    } else {
      const friendlyError = formatErrorMessage(result.error);
      setErrorMessage(friendlyError);
      setModalState('error');
    }
  }, [url]);

  // Subscribe to the previewed podcast
  const handleSubscribe = useCallback(() => {
    if (!previewPodcast) return;

    addPodcast(previewPodcast);
    onDismiss();
  }, [previewPodcast, addPodcast, onDismiss]);

  // Nav to Discover screen
  const handleDiscoverPodcastPress = useCallback(() => {
    onGoToDiscover();
  }, [onGoToDiscover]);

  // const handlePodcastPress = useCallback(
  //   (podcast: DiscoveryPodcast) => {
  //     onPodcastPress(podcast);
  //   },
  //   [onPodcastPress],
  // );

  // Clear preview and go back to input state
  const handleClearPreview = useCallback(() => {
    setPreviewPodcast(null);
    setModalState('idle');
    setErrorMessage(null);
  }, []);

  return {
    url,
    modalState,
    errorMessage,
    previewPodcast,
    isAlreadySubscribed,
    handleUrlChange,
    handleFetchPodcast,
    handleSubscribe,
    handleClearPreview,
    handleDiscoverPodcastPress,
  };
};
