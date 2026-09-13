/**
 * Default network timeout. A hung feed previously stalled Promise.all in
 * RefreshService forever, which meant lastRefreshTime never updated and every
 * foreground fired another parallel storm of hanging requests.
 */
export const DEFAULT_FETCH_TIMEOUT_MS = 15000;

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
  } finally {
    clearTimeout(timer);
  }
}

/**
 * True when a rejected fetch was aborted by our own timeout, so callers can
 * say "timed out" instead of surfacing a generic network error.
 */
export function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}
