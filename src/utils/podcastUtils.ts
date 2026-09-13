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
