import { Podcast } from '../models';

/**
 * Whether a feed URL is among the user's subscriptions.
 *
 * Compares case-insensitively: the same show reached through Discover and
 * through a pasted RSS URL often differs only in casing.
 */
export function isSubscribed(
  feedUrl: string,
  subscribedFeedUrls: string[],
): boolean {
  const normalized = feedUrl.toLowerCase();
  return subscribedFeedUrls.some((url) => url.toLowerCase() === normalized);
}

/**
 * A copy of a podcast with its episode list emptied, for records that embed
 * a podcast just to show its name and artwork (queue items, listening history).
 *
 * Android caps AsyncStorage at 6 MB by default, and one long-running show's
 * episode list can use nearly all of that. Nothing reads `episodes` from
 * these records: `podcastStore` is the source of truth for episode lists.
 */
export function withoutEpisodes(podcast: Podcast): Podcast {
  return { ...podcast, episodes: [] };
}
