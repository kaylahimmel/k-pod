import { formatHistoryItemForList } from '../../utils';
import { FormattedHistoryItem, ListeningHistory } from '../../models';

/**
 * Formats the episodes of one podcast that the user has finished.
 *
 * Sourced from listening history rather than `episode.played` because history
 * is the record that already exists: episodes only started being flagged
 * played recently, so the flag is empty for anything completed before that.
 *
 * Note: the shared history formatter is imported across screen folders, which
 * the layering rules discourage. Every screen-to-screen presenter import gets
 * consolidated into src/utils in the duplication cleanup; this follows the
 * existing pattern rather than adding a second copy of the formatter.
 */
export function formatCompletedEpisodes(
  history: ListeningHistory[],
  podcastId: string,
): FormattedHistoryItem[] {
  const forThisPodcast = history.filter(
    (item) => item.podcast.id === podcastId,
  );

  // Newest first. completedAt is an ISO string, so it needs parsing to compare.
  const sorted = [...forThisPodcast].sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );

  // The index is part of each id, so replaying an episode doesn't produce
  // duplicate React keys
  return sorted.map((item, index) => formatHistoryItemForList(item, index));
}

/**
 * Header summary for the Completed screen
 */
export function getCompletedSummary(itemCount: number): string {
  if (itemCount === 0) {
    return 'No completed episodes yet';
  }
  if (itemCount === 1) {
    return '1 completed episode';
  }
  return `${itemCount} completed episodes`;
}
