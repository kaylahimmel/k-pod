import { AppState, AppStateStatus } from 'react-native';
import { RSSService } from './RSSService';
import { podcastStore } from '../stores';
import { Podcast } from '../models';

// Minimum interval between automatic refreshes (in milliseconds)
const MIN_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

// Track last refresh time
let lastRefreshTime: number | null = null;
let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null =
  null;

interface RefreshResult {
  podcastId: string;
  podcastTitle: string;
  success: boolean;
  newEpisodeCount: number;
  error?: string;
}

interface RefreshAllResult {
  totalPodcasts: number;
  successCount: number;
  failCount: number;
  totalNewEpisodes: number;
  results: RefreshResult[];
}

/**
 * Refreshes a single podcast's episodes
 * Returns information about any new episodes found
 */
async function refreshPodcast(podcast: Podcast): Promise<RefreshResult> {
  const result = await RSSService.refreshEpisodes(podcast.id, podcast.rssUrl);

  if (!result.success) {
    return {
      podcastId: podcast.id,
      podcastTitle: podcast.title,
      success: false,
      newEpisodeCount: 0,
      error: result.error,
    };
  }

  const existingIds = new Set(podcast.episodes.map((ep) => ep.id));
  const newEpisodes = result.data!.filter((ep) => !existingIds.has(ep.id));

  // Update the store
  podcastStore.getState().updatePodcastEpisodes(podcast.id, result.data!);

  return {
    podcastId: podcast.id,
    podcastTitle: podcast.title,
    success: true,
    newEpisodeCount: newEpisodes.length,
  };
}

/**
 * Refreshes all subscribed podcasts
 * Fetches latest episodes from all RSS feeds in parallel
 */
async function refreshAllPodcasts(): Promise<RefreshAllResult> {
  const { podcasts } = podcastStore.getState();

  if (podcasts.length === 0) {
    return {
      totalPodcasts: 0,
      successCount: 0,
      failCount: 0,
      totalNewEpisodes: 0,
      results: [],
    };
  }

  // Refresh all podcasts in parallel
  const results = await Promise.all(
    podcasts.map((podcast) => refreshPodcast(podcast)),
  );

  lastRefreshTime = Date.now();

  const successCount = results.filter((r) => r.success).length;
  const totalNewEpisodes = results.reduce(
    (sum, r) => sum + r.newEpisodeCount,
    0,
  );

  return {
    totalPodcasts: podcasts.length,
    successCount,
    failCount: podcasts.length - successCount,
    totalNewEpisodes,
    results,
  };
}

/**
 * Checks if enough time has passed since last refresh
 * Used to prevent excessive API calls
 */
function shouldRefresh(): boolean {
  if (lastRefreshTime === null) return true;
  return Date.now() - lastRefreshTime >= MIN_REFRESH_INTERVAL;
}

/**
 * Handles app state changes for foreground refresh
 * Triggers a refresh when app becomes active (if enough time has passed)
 */
function handleAppStateChange(
  nextAppState: AppStateStatus,
  onRefreshComplete?: (result: RefreshAllResult) => void,
) {
  if (nextAppState === 'active' && shouldRefresh()) {
    refreshAllPodcasts().then((result) => {
      if (onRefreshComplete) {
        onRefreshComplete(result);
      }
    });
  }
}

/**
 * Starts listening for app state changes to trigger automatic refresh
 * Call this when the app initializes
 */
function startForegroundRefresh(
  onRefreshComplete?: (result: RefreshAllResult) => void,
): void {
  // Remove any existing subscription
  stopForegroundRefresh();

  appStateSubscription = AppState.addEventListener('change', (state) => {
    handleAppStateChange(state, onRefreshComplete);
  });
}

/**
 * Stops listening for app state changes
 * Call this when cleaning up (though typically this would run for app lifetime)
 */
function stopForegroundRefresh(): void {
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
}

/**
 * Gets the time since last refresh in milliseconds
 * Returns null if never refreshed
 */
function getTimeSinceLastRefresh(): number | null {
  if (lastRefreshTime === null) return null;
  return Date.now() - lastRefreshTime;
}

/**
 * Resets the last refresh time
 * Useful for testing or forcing a refresh on next app activation
 */
function resetRefreshTimer(): void {
  lastRefreshTime = null;
}

export const RefreshService = {
  refreshPodcast,
  refreshAllPodcasts,
  shouldRefresh,
  startForegroundRefresh,
  stopForegroundRefresh,
  getTimeSinceLastRefresh,
  resetRefreshTimer,
};
