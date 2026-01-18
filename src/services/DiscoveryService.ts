import {
  DiscoveryPodcast,
  ITunesPodcast,
  ITunesSearchResponse,
  SearchParams,
  ServiceResult,
} from '../models';
import { PODCAST_GENRES, PodcastGenre } from '../constants/PodcastGenres';

// ============================================
// CONSTANTS
// ============================================
const ITUNES_SEARCH_BASE = 'https://itunes.apple.com/search';
const ITUNES_LOOKUP_BASE = 'https://itunes.apple.com/lookup';
const DEFAULT_LIMIT = 25;
const DEFAULT_COUNTRY = 'US';

// ============================================
// HELPER FUNCTIONS
// ============================================
/**
 * Transform iTunes API podcast result to our app's DiscoveryPodcast format
 */
function transformToDiscoveryPodcast(item: ITunesPodcast): DiscoveryPodcast {
  return {
    id: item.trackId.toString(),
    title: item.trackName || item.collectionName || 'Unknown Podcast',
    author: item.artistName || 'Unknown Author',
    feedUrl: item.feedUrl,
    artworkUrl: item.artworkUrl600 || item.artworkUrl100 || '',
    genre: item.primaryGenreName || '',
    episodeCount: item.trackCount || 0,
  };
}

/**
 * Build URL with query parameters
 */
function buildSearchUrl(params: Record<string, string | number>): string {
  const url = new URL(ITUNES_SEARCH_BASE);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  return url.toString();
}

/**
 * Filter out results without feed URLs (required for subscribing)
 */
function filterValidPodcasts(items: ITunesPodcast[]): ITunesPodcast[] {
  return items.filter((item) => item.feedUrl && item.feedUrl.length > 0);
}

// ============================================
// MAIN FUNCTIONS
// ============================================
/**
 * Search for podcasts by query string
 * Uses iTunes Search API to find podcasts matching the search term
 */
async function searchPodcasts(
  params: SearchParams,
): Promise<ServiceResult<DiscoveryPodcast[]>> {
  try {
    const { query, limit = DEFAULT_LIMIT, country = DEFAULT_COUNTRY } = params;

    if (!query || query.trim().length === 0) {
      return { success: false, error: 'Search query is required' };
    }

    const url = buildSearchUrl({
      term: query.trim(),
      media: 'podcast',
      entity: 'podcast',
      limit,
      country,
    });

    const response = await fetch(url);

    if (!response.ok) {
      return {
        success: false,
        error: `Search failed: ${response.status} ${response.statusText}`,
      };
    }

    const data: ITunesSearchResponse = await response.json();
    const validPodcasts = filterValidPodcasts(data.results);
    const podcasts = validPodcasts.map(transformToDiscoveryPodcast);

    return { success: true, data: podcasts };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Search failed: ${message}` };
  }
}

/**
 * Get trending/popular podcasts
 * Fetches top podcasts from iTunes by genre
 */
async function getTrendingPodcasts(
  genre: PodcastGenre = 'ALL',
  limit: number = DEFAULT_LIMIT,
  country: string = DEFAULT_COUNTRY,
): Promise<ServiceResult<DiscoveryPodcast[]>> {
  try {
    const genreId = PODCAST_GENRES[genre];

    // Use a broad search term to get popular results in the genre
    // iTunes doesn't have a direct "trending" endpoint, so we search by genre
    const url = buildSearchUrl({
      term: 'podcast',
      media: 'podcast',
      entity: 'podcast',
      genreId,
      limit,
      country,
    });

    const response = await fetch(url);

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch trending: ${response.status} ${response.statusText}`,
      };
    }

    const data: ITunesSearchResponse = await response.json();
    const validPodcasts = filterValidPodcasts(data.results);
    const podcasts = validPodcasts.map(transformToDiscoveryPodcast);

    return { success: true, data: podcasts };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to fetch trending: ${message}` };
  }
}

/**
 * Get podcast recommendations based on subscribed podcasts
 * Searches for similar podcasts by genre of existing subscriptions
 */
async function getRecommendations(
  subscribedPodcastGenres: string[],
  limit: number = DEFAULT_LIMIT,
  country: string = DEFAULT_COUNTRY,
): Promise<ServiceResult<DiscoveryPodcast[]>> {
  try {
    // If no genres provided, return trending podcasts instead
    if (!subscribedPodcastGenres || subscribedPodcastGenres.length === 0) {
      return getTrendingPodcasts('ALL', limit, country);
    }

    // Get unique genres and search for podcasts in each
    const uniqueGenres = [...new Set(subscribedPodcastGenres)];
    const limitPerGenre = Math.ceil(limit / uniqueGenres.length);

    const allResults: DiscoveryPodcast[] = [];

    // Fetch podcasts from each genre
    for (const genre of uniqueGenres) {
      const url = buildSearchUrl({
        term: genre,
        media: 'podcast',
        entity: 'podcast',
        limit: limitPerGenre,
        country,
      });

      const response = await fetch(url);

      if (response.ok) {
        const data: ITunesSearchResponse = await response.json();
        const validPodcasts = filterValidPodcasts(data.results);
        const podcasts = validPodcasts.map(transformToDiscoveryPodcast);
        allResults.push(...podcasts);
      }
    }

    // Remove duplicates by ID and limit results
    const uniqueResults = Array.from(
      new Map(allResults.map((p) => [p.id, p])).values(),
    ).slice(0, limit);

    return { success: true, data: uniqueResults };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Failed to fetch recommendations: ${message}`,
    };
  }
}

/**
 * Get podcast details by iTunes ID
 * Useful for fetching more info about a specific podcast
 */
async function getPodcastById(
  podcastId: string,
): Promise<ServiceResult<DiscoveryPodcast>> {
  try {
    const url = `${ITUNES_LOOKUP_BASE}?id=${podcastId}&entity=podcast`;
    const response = await fetch(url);

    if (!response.ok) {
      return {
        success: false,
        error: `Lookup failed: ${response.status} ${response.statusText}`,
      };
    }

    const data: ITunesSearchResponse = await response.json();

    if (data.resultCount === 0 || !data.results[0]) {
      return { success: false, error: 'Podcast not found' };
    }

    const podcast = data.results[0];
    if (!podcast.feedUrl) {
      return { success: false, error: 'Podcast has no RSS feed available' };
    }

    return { success: true, data: transformToDiscoveryPodcast(podcast) };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Lookup failed: ${message}` };
  }
}

// ============================================
// EXPORTS
// ============================================
export const DiscoveryService = {
  searchPodcasts,
  getTrendingPodcasts,
  getRecommendations,
  getPodcastById,
  // Expose helpers for testing
  _helpers: {
    transformToDiscoveryPodcast,
    buildSearchUrl,
    filterValidPodcasts,
  },
};
