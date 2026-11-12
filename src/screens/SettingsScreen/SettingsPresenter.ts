import { ListeningHistory, User } from '../../models';
import { SettingStat } from '../../components';
import { COMPLETION_THRESHOLD_PERCENT } from '../../constants';
import { FormattedAccount } from './Settings.types';

/**
 * Formats listening time in seconds to a human-readable string
 * Examples: "0 min", "45 min", "1h 30m", "24h 15m"
 */
export function formatListeningTime(seconds: number): string {
  // Number.isFinite also rejects NaN and Infinity (a feed with an unknown
  // duration), which would otherwise render "Infinityh NaNm"
  if (!Number.isFinite(seconds) || seconds <= 0) {
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
 * Formats the signed-in user for the account row at the top of Settings. Falls back to a
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
 * Counts completed episodes (at or past COMPLETION_THRESHOLD_PERCENT).
 * History is only written past that point today, so this matches
 * history.length, but it stays correct if partial history is ever saved
 */
export function countCompletedEpisodes(history: ListeningHistory[]): number {
  return history.filter(
    (item) => item.completionPercentage >= COMPLETION_THRESHOLD_PERCENT,
  ).length;
}

/**
 * Builds the three stats in the row under the account email, in the shape
 * SettingStatsRow draws (labels live here so the View just passes them on)
 */
export function getListeningStats(
  history: ListeningHistory[],
  podcastsSubscribed: number,
): SettingStat[] {
  return [
    {
      label: 'Listening Time',
      value: formatListeningTime(calculateTotalListeningTime(history)),
    },
    { label: 'Episodes', value: countCompletedEpisodes(history) },
    { label: 'Subscribed', value: podcastsSubscribed },
  ];
}
