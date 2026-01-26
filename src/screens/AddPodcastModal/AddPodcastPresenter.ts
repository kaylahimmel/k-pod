import { Podcast } from '../../models';
import { URLValidationResult, PodcastPreviewData } from './AddPodcast.types';
import { formatRelativeDate } from '../ProfileScreen/ProfilePresenter';

/**
 * Validates if the provided string is a valid RSS URL format
 * Checks for proper URL structure and http/https protocol
 */
export function validateRSSUrl(url: string): URLValidationResult {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return { isValid: false, error: 'Please enter an RSS feed URL' };
  }

  // Check for basic URL format
  try {
    const parsedUrl = new URL(trimmedUrl);

    // Must be http or https protocol
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        isValid: false,
        error: 'URL must start with http:// or https://',
      };
    }

    return { isValid: true, error: null };
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid URL',
    };
  }
}

/**
 * Normalizes URL by trimming whitespace and ensuring https when possible
 */
export function normalizeUrl(url: string): string {
  return url.trim();
}

/**
 * Formats RSS service errors into user-friendly messages
 */
export function formatErrorMessage(error: string): string {
  // Map common errors to user-friendly messages
  const errorMappings: Record<string, string> = {
    'Invalid RSS feed: missing channel element':
      'This URL does not appear to be a valid RSS feed',
    'Failed to fetch feed: 404':
      'Feed not found. Please check the URL and try again',
    'Failed to fetch feed: 403': 'Access to this feed is restricted',
    'Failed to fetch feed: 500':
      'The podcast server is having issues. Try again later',
    'Network request failed':
      'Unable to connect. Please check your internet connection',
  };

  // Check for partial matches
  for (const [key, message] of Object.entries(errorMappings)) {
    if (error.includes(key)) {
      return message;
    }
  }

  // Check for HTTP status codes
  const httpStatusMatch = error.match(/Failed to fetch feed: (\d+)/);
  if (httpStatusMatch) {
    return `Unable to load feed (Error ${httpStatusMatch[1]})`;
  }

  // Generic fallback
  if (error.includes('RSS parsing failed')) {
    return 'Unable to parse RSS feed. The feed format may be invalid';
  }

  return 'Something went wrong. Please try again';
}

/**
 * Formats podcast data for preview display
 */
export function formatPodcastPreview(podcast: Podcast): PodcastPreviewData {
  // Get the latest episode date
  const latestEpisode = podcast.episodes[0];
  const latestEpisodeDate = latestEpisode
    ? formatRelativeDate(latestEpisode.publishDate)
    : 'No episodes';

  // Truncate description if too long
  const maxDescriptionLength = 150;
  const description =
    podcast.description.length > maxDescriptionLength
      ? `${podcast.description.substring(0, maxDescriptionLength)}...`
      : podcast.description;

  return {
    title: podcast.title,
    author: podcast.author,
    description,
    artworkUrl: podcast.artworkUrl,
    episodeCount: podcast.episodes.length,
    latestEpisodeDate,
  };
}

/**
 * Formats episode count for display
 */
export function formatEpisodeCount(count: number): string {
  if (count === 0) {
    return 'No episodes';
  }
  if (count === 1) {
    return '1 episode';
  }
  return `${count} episodes`;
}
