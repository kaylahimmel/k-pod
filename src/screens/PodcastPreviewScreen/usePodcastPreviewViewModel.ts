import { useState, useCallback, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { usePodcastStore, useToast } from '../../hooks';
import { RSSService } from '../../services';
import { DiscoveryPodcast, Episode, Podcast } from '../../models';
import {
  formatPodcastPreview,
  formatPreviewEpisodes,
  isSubscribed,
} from './PodcastPreviewPresenter';

// Subscribe button display state type
export interface SubscribeButtonState {
  isDisabled: boolean;
  iconName: 'checkmark' | 'add';
  label: string;
  showSpinner: boolean;
  // Style keys that map to styles in PodcastPreview.styles.ts
  styleKeys: (
    | 'subscribeButton'
    | 'subscribedButton'
    | 'subscribeButtonDisabled'
  )[];
}

/**
 * ViewModel hook for the PodcastPreviewScreen
 * Handles fetching episodes and subscribe functionality for discovery podcasts
 */
export const usePodcastPreviewViewModel = (
  podcast: DiscoveryPodcast,
  onSubscribe: () => void,
  onEpisodePress: (episode: Episode) => void,
) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(true);
  const [episodeError, setEpisodeError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const { podcasts, addPodcast } = usePodcastStore();
  const toast = useToast();
  const subscribedFeedUrls = podcasts.map((p) => p.rssUrl);

  // Format podcast for display using presenter
  const formattedPodcast = formatPodcastPreview(podcast);
  const formattedEpisodes = formatPreviewEpisodes(episodes, 5);

  // Check if already subscribed
  const alreadySubscribed = isSubscribed(podcast.feedUrl, subscribedFeedUrls);

  // Derived state for UI conditions
  const hasEpisodeError = episodeError !== null;
  const hasNoEpisodes =
    episodes.length === 0 && !isLoadingEpisodes && !episodeError;

  // Subscribe button display state - derived from subscription state
  const subscribeButtonState: SubscribeButtonState = useMemo(() => {
    if (alreadySubscribed) {
      return {
        isDisabled: true,
        iconName: 'checkmark',
        label: 'Subscribed',
        showSpinner: false,
        styleKeys: ['subscribeButton', 'subscribedButton'],
      };
    }
    if (isSubscribing) {
      return {
        isDisabled: true,
        iconName: 'add',
        label: 'Subscribing...',
        showSpinner: true,
        styleKeys: ['subscribeButton', 'subscribeButtonDisabled'],
      };
    }
    return {
      isDisabled: false,
      iconName: 'add',
      label: 'Subscribe',
      showSpinner: false,
      styleKeys: ['subscribeButton'],
    };
  }, [alreadySubscribed, isSubscribing]);

  // Fetch episodes when the component mounts
  useEffect(() => {
    const fetchEpisodes = async () => {
      setIsLoadingEpisodes(true);
      setEpisodeError(null);

      const result = await RSSService.transformPodcastFromRSS(podcast.feedUrl);

      if (result.success) {
        setEpisodes(result.data.episodes);
      } else {
        setEpisodeError(result.error || 'Failed to load episodes');
        setEpisodes([]);
      }

      setIsLoadingEpisodes(false);
    };

    fetchEpisodes();
  }, [podcast.feedUrl]);

  // Retry fetching episodes after an error
  const handleRetryEpisodes = useCallback(async () => {
    setIsLoadingEpisodes(true);
    setEpisodeError(null);

    const result = await RSSService.transformPodcastFromRSS(podcast.feedUrl);

    if (result.success) {
      setEpisodes(result.data.episodes);
    } else {
      setEpisodeError(result.error || 'Failed to load episodes');
      setEpisodes([]);
    }

    setIsLoadingEpisodes(false);
  }, [podcast.feedUrl]);

  // Subscribe to the podcast
  const handleSubscribe = useCallback(async () => {
    if (alreadySubscribed) return;

    setIsSubscribing(true);

    try {
      const result = await RSSService.transformPodcastFromRSS(podcast.feedUrl);

      if (result.success) {
        // Use RSS data but preserve discovery metadata for better quality
        const podcastToAdd: Podcast = {
          ...result.data,
          id: podcast.id,
          title: podcast.title || result.data.title,
          author: podcast.author || result.data.author,
          artworkUrl: podcast.artworkUrl || result.data.artworkUrl,
          description: podcast.description || result.data.description,
        };

        addPodcast(podcastToAdd);
        toast.showToast(`Subscribed to "${podcast.title}"`);
        onSubscribe();
      } else {
        Alert.alert(
          'Subscription Failed',
          result.error || 'Failed to subscribe to podcast',
        );
      }
    } catch {
      Alert.alert('Subscription Failed', 'An unexpected error occurred');
    } finally {
      setIsSubscribing(false);
    }
  }, [podcast, alreadySubscribed, addPodcast, toast, onSubscribe]);

  // Toggle description expansion
  const toggleDescription = useCallback(() => {
    setShowFullDescription((prev) => !prev);
  }, []);

  // Handle episode press - find the full episode and call the callback
  const handleEpisodePress = useCallback(
    (episodeId: string) => {
      const episode = episodes.find((ep) => ep.id === episodeId);
      if (episode) {
        onEpisodePress(episode);
      }
    },
    [episodes, onEpisodePress],
  );

  return {
    formattedPodcast,
    formattedEpisodes,
    episodes,
    isLoadingEpisodes,
    episodeError,
    hasEpisodeError,
    hasNoEpisodes,
    showFullDescription,
    subscribeButtonState,
    toast,
    handleRetryEpisodes,
    handleSubscribe,
    toggleDescription,
    handleEpisodePress,
  };
};

export type PodcastPreviewViewModel = ReturnType<
  typeof usePodcastPreviewViewModel
>;
