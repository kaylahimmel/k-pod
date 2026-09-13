/**
 * How much detail a relative date should carry.
 *
 * Two different ladders existed in the app and both are still wanted:
 * - 'compact'  (Profile / history): Today, Yesterday, N days ago, then "Mar 4"
 * - 'detailed' (Library): also weeks and months, then a full date with year
 *
 * The style is explicit at every call site rather than defaulted, so merging
 * these two can't silently change what a screen displays.
 */
export type RelativeDateStyle = 'compact' | 'detailed';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / MS_PER_DAY);
}

/**
 * Formats a date relative to now
 * @param date - ISO string or Date
 * @param style - see RelativeDateStyle
 */
export function formatRelativeDate(
  date: Date | string,
  style: RelativeDateStyle,
): string {
  const target = typeof date === 'string' ? new Date(date) : date;
  const diffDays = daysSince(target);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  if (style === 'compact') {
    const month = target.toLocaleDateString('en-US', { month: 'short' });
    return `${month} ${target.getDate()}`;
  }

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }

  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }

  return target.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats an episode publish date
 * Example: "Today", "Yesterday", "4 days ago", "2 weeks ago", "Mar 4, 2023"
 */
export function formatPublishDate(isoDateString: string): string {
  const date = new Date(isoDateString);
  const diffDays = daysSince(date);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    // Only show the year once it's no longer the current one
    year:
      date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}
