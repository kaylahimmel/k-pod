import { ListeningHistory } from '../../models';
import { FormattedHistoryItem } from '../ProfileScreen/Profile.types';
import {
  formatRelativeDate,
  formatCompletionPercentage,
} from '../ProfileScreen/ProfilePresenter';
import { truncateText } from '../../utils';

/**
 * Formats a listening history item for display in the full history list
 * Similar to ProfilePresenter.formatHistoryItem but optimized for the history screen
 */
export function formatHistoryItemForList(
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
    formattedCompletedAt: formatRelativeDate(item.completedAt),
    completionPercentage: item.completionPercentage,
    formattedCompletionPercentage: formatCompletionPercentage(
      item.completionPercentage,
    ),
  };
}

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
