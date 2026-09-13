import {
  FormattedHistoryItem,
  ListeningHistory,
  Podcast,
  User,
} from '../../models';
import { FormattedUser, ProfileStats } from './Profile.types';
import {
  formatCompletionPercentage,
  formatRelativeDate,
  truncateText,
} from '../../utils';

/**
 * Formats listening time in seconds to a human-readable string
 * Examples: "0 min", "45 min", "1h 30m", "24h 15m"
 */
export function formatListeningTime(seconds: number): string {
  if (!seconds || seconds <= 0) {
    return '0 min';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

/**
 * Extracts initials from an email address
 * Example: "john.doe@example.com" -> "JD"
 */
export function getInitialsFromEmail(email: string): string {
  const localPart = email.split('@')[0];
  const parts = localPart.split(/[._-]/);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return localPart.slice(0, 2).toUpperCase();
}

/**
 * Formats a user object for display
 */
export function formatUser(user: User | null): FormattedUser | null {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    displayEmail: user.email,
    initials: getInitialsFromEmail(user.email),
    theme: user.preferences.theme,
    notificationsEnabled: user.preferences.notifications,
  };
}

/**
 * Formats a listening history item for display
 */
export function formatHistoryItem(
  item: ListeningHistory,
  index: number,
): FormattedHistoryItem {
  return {
    id: `${item.episode.id}-${index}`,
    episodeTitle: item.episode.title,
    displayTitle: truncateText(item.episode.title, 50),
    podcastTitle: item.podcast.title,
    podcastArtworkUrl: item.podcast.artworkUrl,
    completedAt: item.completedAt,
    formattedCompletedAt: formatRelativeDate(item.completedAt, 'compact'),
    completionPercentage: item.completionPercentage,
    formattedCompletionPercentage: formatCompletionPercentage(
      item.completionPercentage,
    ),
  };
}

/**
 * Formats an array of listening history items for display
 */
export function formatHistoryItems(
  history: ListeningHistory[],
): FormattedHistoryItem[] {
  return history.map((item, index) => formatHistoryItem(item, index));
}

/**
 * Calculates total listening time from history
 * Returns total seconds listened
 */
export function calculateTotalListeningTime(
  history: ListeningHistory[],
): number {
  return history.reduce((total, item) => {
    const episodeDuration = item.episode.duration || 0;
    const listenedPortion = (item.completionPercentage / 100) * episodeDuration;
    return total + listenedPortion;
  }, 0);
}

/**
 * Counts completed episodes (>= 90% listened)
 */
export function countCompletedEpisodes(history: ListeningHistory[]): number {
  return history.filter((item) => item.completionPercentage >= 90).length;
}

/**
 * Formats a count with singular/plural label
 */
export function formatCountLabel(
  count: number,
  singular: string,
  plural: string,
): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
}

/**
 * Generates profile statistics from history and podcasts
 */
export function getProfileStats(
  history: ListeningHistory[],
  subscribedPodcasts: Podcast[],
): ProfileStats {
  const totalSeconds = calculateTotalListeningTime(history);
  const episodesCompleted = countCompletedEpisodes(history);
  const podcastsSubscribed = subscribedPodcasts.length;

  return {
    totalListeningTime: formatListeningTime(totalSeconds),
    episodesCompleted,
    episodesCompletedLabel: formatCountLabel(
      episodesCompleted,
      'Episode',
      'Episodes',
    ),
    podcastsSubscribed,
    podcastsSubscribedLabel: formatCountLabel(
      podcastsSubscribed,
      'Podcast',
      'Podcasts',
    ),
  };
}
