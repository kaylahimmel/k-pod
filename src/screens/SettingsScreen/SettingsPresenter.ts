import { ListeningHistory, Podcast, User } from '../../models';
import { FormattedAccount, ListeningStats } from './Settings.types';

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
 * Formats the signed-in user for the Account section. Falls back to a
 * placeholder so the row still renders if the auth state is briefly empty
 */
export function formatAccount(user: User | null): FormattedAccount {
  if (!user) {
    return { email: 'Not signed in', initials: '?' };
  }

  return { email: user.email, initials: getInitialsFromEmail(user.email) };
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
 * Builds the three stats shown in the Listening section
 */
export function getListeningStats(
  history: ListeningHistory[],
  subscribedPodcasts: Podcast[],
): ListeningStats {
  return {
    totalListeningTime: formatListeningTime(
      calculateTotalListeningTime(history),
    ),
    episodesCompleted: countCompletedEpisodes(history),
    podcastsSubscribed: subscribedPodcasts.length,
  };
}
