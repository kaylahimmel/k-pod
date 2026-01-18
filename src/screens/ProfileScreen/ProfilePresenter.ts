import { ListeningHistory, User, Podcast } from '../../models';
import {
  FormattedHistoryItem,
  FormattedUser,
  ProfileStats,
} from './Profile.types';
import { truncateText } from '../../utils';

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
 * Formats a date to a relative time string or formatted date
 * Examples: "Today", "Yesterday", "3 days ago", "Jan 15"
 */
export function formatRelativeDate(date: Date | string): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  const month = targetDate.toLocaleDateString('en-US', { month: 'short' });
  const day = targetDate.getDate();
  return `${month} ${day}`;
}

/**
 * Formats completion percentage to a display string
 */
export function formatCompletionPercentage(percentage: number): string {
  if (percentage >= 100) {
    return 'Completed';
  }
  return `${Math.round(percentage)}% listened`;
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
    completedAt:
      item.completedAt instanceof Date
        ? item.completedAt.toISOString()
        : String(item.completedAt),
    formattedCompletedAt: formatRelativeDate(item.completedAt),
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
 * Gets the most recent history items (limited count)
 */
export function getRecentHistory(
  history: ListeningHistory[],
  limit: number = 3,
): FormattedHistoryItem[] {
  const sorted = [...history].sort((a, b) => {
    const dateA =
      a.completedAt instanceof Date ? a.completedAt : new Date(a.completedAt);
    const dateB =
      b.completedAt instanceof Date ? b.completedAt : new Date(b.completedAt);
    return dateB.getTime() - dateA.getTime();
  });

  return formatHistoryItems(sorted.slice(0, limit));
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
