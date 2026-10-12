/**
 * Default network timeout. A hung feed previously stalled Promise.all in
 * RefreshService forever, which meant lastRefreshTime never updated and every
 * foreground fired another parallel storm of hanging requests.
 */
export const DEFAULT_FETCH_TIMEOUT_MS = 15000;

/** Name given to the error fetchWithTimeout throws when its timer fires */
const TIMEOUT_ERROR_NAME = 'TimeoutError';

/**
 * fetch() that gives up after `timeoutMs`.
 *
 * Uses AbortController + setTimeout rather than AbortSignal.timeout(): Node 18+
 * implements the static helper, so Jest would pass, but React Native's fetch
 * polyfill does not reliably provide it. AbortController has been polyfilled in
 * React Native for years, so this behaves the same on device and in tests.
 */
export async function fetchWithTimeout(
  url: string,
  timeoutMs: number = DEFAULT_FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    // Expo replaces the global fetch with expo/fetch (SDK 56+), which rejects
    // an aborted request with a generic FetchError named "Error" rather than
    // "AbortError". Checking our own signal identifies the timeout no matter
    // which fetch implementation threw, so callers can rely on isTimeoutError()
    if (controller.signal.aborted) {
      const timeoutError = new Error(`Request timed out after ${timeoutMs}ms`);
      timeoutError.name = TIMEOUT_ERROR_NAME;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * True when a rejected fetch was aborted by our own timeout, so callers can
 * say "timed out" instead of surfacing a generic network error.
 */
export function isTimeoutError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === TIMEOUT_ERROR_NAME || error.name === 'AbortError')
  );
}
