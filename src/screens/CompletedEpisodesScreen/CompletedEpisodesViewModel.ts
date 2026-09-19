import { useCallback, useMemo, useState } from 'react';
import { Alert, Share } from 'react-native';
import { useHistoryStore, useQueueStore, useToast } from '../../hooks';
import { QueueItem } from '../../models';
import {
  formatCompletedEpisodes,
  getCompletedSummary,
} from './CompletedEpisodesPresenter';
import { CompletedEpisodesViewModelReturn } from './CompletedEpisodes.types';

/**
 * ViewModel for the Completed episodes screen.
 *
 * Keeps the raw history entries alongside the formatted ones because the
 * action menu needs the full Episode and Podcast objects (to build a queue
 * item and a share link), which the formatted display type doesn't carry.
 * The two lists are index-aligned, so the menu is addressed by index.
 */
export const useCompletedEpisodesViewModel = (
  podcastId: string,
): CompletedEpisodesViewModelReturn => {
  const { history, hasHydrated } = useHistoryStore();
  const { queue, addToQueue } = useQueueStore();
  const toast = useToast();

  const [menuIndex, setMenuIndex] = useState<number | null>(null);

  // Same filter and sort the presenter applies, kept as raw entries
  const rawCompleted = useMemo(() => {
    return [...history]
      .filter((item) => item.podcast.id === podcastId)
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
      );
  }, [history, podcastId]);

  const episodes = useMemo(
    () => formatCompletedEpisodes(history, podcastId),
    [history, podcastId],
  );

  const isLoading = !hasHydrated;
  const isEmpty = episodes.length === 0;
  const summary = useMemo(
    () => getCompletedSummary(episodes.length),
    [episodes.length],
  );

  const selected = menuIndex === null ? null : rawCompleted[menuIndex];

  const handleOpenMenu = useCallback(
    (index: number) => setMenuIndex(index),
    [],
  );
  const handleCloseMenu = useCallback(() => setMenuIndex(null), []);

  const handleAddToQueue = useCallback(() => {
    if (!selected) return;
    const { episode, podcast } = selected;

    if (queue.some((item) => item.episode.id === episode.id)) {
      toast.showToast('This episode is already in your queue');
      setMenuIndex(null);
      return;
    }

    const queueItem: QueueItem = {
      id: `${episode.id}-${Date.now()}`,
      episode,
      podcast,
      position: queue.length,
    };

    addToQueue(queueItem);
    toast.showToast(`"${episode.title}" added to queue`);
    setMenuIndex(null);
  }, [selected, queue, addToQueue, toast]);

  const handleShare = useCallback(async () => {
    if (!selected) return;
    const { episode, podcast } = selected;

    // Prefer the episode's web page; audioUrl is a raw media file and makes a
    // poor thing to send someone. Older cached episodes have no link until
    // the podcast is refreshed, hence the fallback.
    const url = episode.link || episode.audioUrl;

    setMenuIndex(null);

    try {
      await Share.share({
        message: `${episode.title} — ${podcast.title}\n${url}`,
      });
    } catch {
      Alert.alert('Error', 'Unable to share this episode.');
    }
  }, [selected]);

  return {
    episodes,
    isLoading,
    isEmpty,
    summary,
    menuIndex,
    menuEpisodeTitle: selected?.episode.title ?? '',
    toast,
    handleOpenMenu,
    handleCloseMenu,
    handleAddToQueue,
    handleShare,
  };
};

export type CompletedEpisodesViewModel = ReturnType<
  typeof useCompletedEpisodesViewModel
>;
