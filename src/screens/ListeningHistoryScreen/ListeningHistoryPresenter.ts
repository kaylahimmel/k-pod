import { FormattedHistoryItem, ListeningHistory } from '../../models';

import {
  formatCompletionPercentage,
  formatHistoryItemForList,
  formatRelativeDate,
  truncateText,
} from '../../utils';

/**
 * Formats and sorts all history items for display (most recent first)
 */
export function formatAllHistory(
  history: ListeningHistory[],
): FormattedHistoryItem[] {
  // Newest first. completedAt is an ISO string, so it needs parsing to compare.
  const sorted = [...history].sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );

  return sorted.map((item, index) => formatHistoryItemForList(item, index));
}

/**
 * Gets a summary message for the history screen header
 */
export function getHistorySummary(itemCount: number): string {
  if (itemCount === 0) {
    return 'No episodes listened yet';
  }
  if (itemCount === 1) {
    return '1 episode in history';
  }
  return `${itemCount} episodes in history`;
}
