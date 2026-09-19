import { FormattedHistoryItem, ListeningHistory } from '../models';
import { truncateText } from './textUtils';
import { formatRelativeDate } from './dateUtils';
import { formatCompletionPercentage } from './formatUtils';

/**
 * Formats one listening-history entry for display.
 *
 * Shared by the ListeningHistory screen and the per-podcast Completed screen,
 * so it lives here rather than in either screen's presenter - importing a
 * presenter across screen folders breaks the layering rule.
 *
 * @param index - position in the rendered list; used to build a stable key,
 *   since the same episode can appear only once but ids must stay unique
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
    formattedCompletedAt: formatRelativeDate(item.completedAt, 'compact'),
    completionPercentage: item.completionPercentage,
    formattedCompletionPercentage: formatCompletionPercentage(
      item.completionPercentage,
    ),
  };
}
