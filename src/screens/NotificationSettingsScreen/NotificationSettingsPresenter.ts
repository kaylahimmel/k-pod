import { Podcast } from '../../models';
import { NotificationPodcast } from './NotificationSettings.types';

/**
 * Builds the per-podcast notification rows.
 * Settings store a *muted* list rather than an enabled list, so a podcast
 * subscribed after notifications were turned on is enabled by default.
 */
export function formatNotificationPodcasts(
  podcasts: Podcast[],
  mutedIds: string[],
): NotificationPodcast[] {
  const muted = new Set(mutedIds);
  return podcasts.map((podcast) => ({
    id: podcast.id,
    title: podcast.title,
    enabled: !muted.has(podcast.id),
  }));
}
