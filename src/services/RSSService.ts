import { XMLParser } from 'fast-xml-parser';
import { Episode, Podcast, RSSFeed, RSSItem, ServiceResult } from '../models';

// ============================================
// PARSER CONFIGURATION
// ============================================
/**
 * Configure the XML parser
 * - ignoreAttributes: false - We need attributes like enclosure's url
 * - attributeNamePrefix: '@_' - Prefix for attributes to distinguish from elements
 */
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

// ============================================
// HELPER FUNCTIONS
// ============================================
/**
 * Generate a unique ID from a string (used for episodes without GUIDs)
 * This creates a simple hash - not cryptographically secure, but good enough for IDs
 */
function generateId(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Parse duration string (like "1:23:45" or "5400") into seconds
 * RSS feeds use various formats, so we need to handle multiple cases
 */
function parseDuration(duration: string | number | undefined): number {
  if (!duration) return 0;

  // Convert to string if it's a number
  const durationStr = String(duration);

  // If it's already a number (seconds), return it
  const asNumber = parseInt(durationStr, 10);
  if (!isNaN(asNumber) && !durationStr.includes(':')) {
    return asNumber;
  }

  // Parse time format (HH:MM:SS or MM:SS)
  const parts = durationStr.split(':').map((p) => parseInt(p, 10));
  if (parts.some(isNaN)) return 0;

  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  }

  return 0;
}

/**
 * Extract audio URL from RSS item's enclosure
 * Enclosure is the RSS term for media attachments (like audio files)
 */
function extractAudioUrl(item: RSSItem): string {
  if (item.enclosure?.['@_url']) {
    return item.enclosure['@_url'];
  }
  return '';
}

/**
 * Extract GUID from RSS item
 * GUID can be a simple string or an object with #text property
 */
function extractGuid(item: RSSItem): string {
  if (typeof item.guid === 'string') {
    return item.guid;
  }
  if (item.guid?.['#text']) {
    return item.guid['#text'];
  }
  return '';
}

/**
 * Ensure items is always an array
 * RSS feeds with a single episode return an object, not an array
 */
function normalizeItems(items: RSSItem | RSSItem[] | undefined): RSSItem[] {
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

// ============================================
// MAIN FUNCTIONS
// ============================================
/**
 * Fetch and parse an RSS feed from a URL
 * Returns the raw parsed feed data
 */
async function fetchAndParseFeed(
  rssUrl: string,
): Promise<ServiceResult<RSSFeed>> {
  try {
    const response = await fetch(rssUrl);

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch feed: ${response.status} ${response.statusText}`,
      };
    }

    const xmlText = await response.text();
    const feed = parser.parse(xmlText) as RSSFeed;

    // Validate that it's actually an RSS feed
    if (!feed.rss?.channel) {
      return {
        success: false,
        error: 'Invalid RSS feed: missing channel element',
      };
    }

    return { success: true, data: feed };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `RSS parsing failed: ${message}` };
  }
}

/**
 * Transform a parsed RSS feed into our Podcast model
 * This maps the RSS-specific fields to our app's data structure
 */
function transformFeedToPodcast(feed: RSSFeed, rssUrl: string): Podcast {
  const now = new Date().toISOString();
  const channel = feed.rss.channel;
  const items = normalizeItems(channel.item);

  const episodes: Episode[] = items.map((item: RSSItem) => {
    const guid = extractGuid(item);
    return {
      id: guid || generateId(rssUrl + item.title + item.pubDate),
      podcastId: generateId(rssUrl),
      title: item.title || '',
      description: item.description || item['itunes:summary'] || '',
      audioUrl: extractAudioUrl(item),
      duration: parseDuration(item['itunes:duration']),
      publishDate: item.pubDate || now,
      played: false,
    };
  });

  // Get artwork URL - try itunes:image first (higher quality), then channel image
  const artworkUrl =
    channel['itunes:image']?.['@_href'] || channel.image?.url || '';

  return {
    id: generateId(rssUrl),
    title: channel.title || 'Unknown Podcast',
    author: channel['itunes:author'] || channel.title || 'Unknown Author',
    rssUrl: rssUrl,
    artworkUrl,
    description: channel.description || '',
    subscribeDate: now,
    lastUpdated: now,
    episodes,
  };
}

/**
 * Main entry point: Fetch a podcast from its RSS URL
 * Returns a fully-populated Podcast object with episodes
 */
async function transformPodcastFromRSS(
  rssUrl: string,
): Promise<ServiceResult<Podcast>> {
  const feedResult = await fetchAndParseFeed(rssUrl);

  if (!feedResult.success) {
    return feedResult;
  }

  const podcast = transformFeedToPodcast(feedResult.data, rssUrl);
  return { success: true, data: podcast };
}

/**
 * Refresh episodes for an existing podcast
 * Useful for checking for new episodes without re-fetching all podcast metadata
 */
async function refreshEpisodes(
  podcastId: string,
  rssUrl: string,
): Promise<ServiceResult<Episode[]>> {
  const feedResult = await fetchAndParseFeed(rssUrl);

  if (!feedResult.success) {
    return feedResult;
  }

  const podcast = transformFeedToPodcast(feedResult.data, rssUrl);
  // Update episode podcastIds to match the existing podcast
  const episodes = podcast.episodes.map((ep) => ({ ...ep, podcastId }));

  return { success: true, data: episodes };
}

// ============================================
// EXPORTS
// ============================================
export const RSSService = {
  transformPodcastFromRSS,
  refreshEpisodes,
  fetchAndParseFeed,
  // Expose helpers for testing
  _helpers: {
    generateId,
    parseDuration,
    extractAudioUrl,
    extractGuid,
    normalizeItems,
    transformFeedToPodcast,
  },
};
