/**
 * Formats an episode count for display
 * Example: 0 -> "No episodes", 1 -> "1 episode", 42 -> "42 episodes"
 */
export function formatEpisodeCount(count: number): string {
  if (count === 0) {
    return 'No episodes';
  }
  if (count === 1) {
    return '1 episode';
  }
  return `${count} episodes`;
}

/**
 * Formats a duration in seconds as M:SS, or H:MM:SS once it reaches an hour.
 *
 * The guard checks Number.isFinite rather than truthiness. Three different
 * guards used to exist across the presenters, and two of them let Infinity
 * through - a feed reporting an unknown duration rendered "Infinity:NaN:NaN"
 * instead of a fallback.
 */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats a duration in words, for places where "1 hr 23 min" reads better
 * than "1:23:45". Same finite-value guard as formatDuration.
 */
export function formatDurationLong(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0 min';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours} hr ${minutes} min`;
  }
  if (hours > 0) {
    return `${hours} hr`;
  }
  return `${minutes} min`;
}

/**
 * Formats how much of an episode was listened to
 * Example: 100 -> "Completed", 62.4 -> "62% listened"
 */
export function formatCompletionPercentage(percentage: number): string {
  if (percentage >= 100) {
    return 'Completed';
  }
  return `${Math.round(percentage)}% listened`;
}
