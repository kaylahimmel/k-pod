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
 * Formats and sorts all history items for display (most recent first)
 */
export function formatAllHistory(
  history: ListeningHistory[],
): FormattedHistoryItem[] {
  const sorted = [...history].sort((a, b) => {
    const dateA =
      a.completedAt instanceof Date ? a.completedAt : new Date(a.completedAt);
    const dateB =
      b.completedAt instanceof Date ? b.completedAt : new Date(b.completedAt);
    return dateB.getTime() - dateA.getTime();
  });

  return sorted.map((item, index) => formatHistoryItemForList(item, index));
}

/**
 * Gets the original episode and podcast IDs from a formatted history item
 * The id format is "episodeId-index", so we extract just the episode portion
 */
export function extractEpisodeIdFromHistoryItem(
  item: FormattedHistoryItem,
): string {
  // The id is formatted as "episodeId-index", so we need to remove the index suffix
  const parts = item.id.split('-');
  // Remove the last part (index) and rejoin in case episodeId contains dashes
  parts.pop();
  return parts.join('-');
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
