import { fetchWithTimeout, isTimeoutError } from '../fetchWithTimeout';

/**
 * Mimics expo/fetch, which Expo installs as the global fetch on device since
 * SDK 56. When its signal aborts it rejects with a plain `FetchError` whose
 * `name` is "Error", NOT the "AbortError" that Node and browsers throw.
 */
class ExpoFetchError extends Error {
  constructor(message: string) {
    super(`fetch failed: ${message}`);
  }
}

/** A fetch that never resolves on its own and rejects once aborted */
const hangingFetch = (createError: () => Error) =>
  jest.fn(
    (_url: string, init?: { signal?: AbortSignal }) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(createError()));
      }),
  );

describe('fetchWithTimeout', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    global.fetch = originalFetch;
  });

  it('should resolve with the response when fetch completes in time', async () => {
    const response = { ok: true } as Response;
    global.fetch = jest.fn(() => Promise.resolve(response));

    await expect(fetchWithTimeout('https://example.com')).resolves.toBe(
      response,
    );
  });

  it('should report a timeout when expo/fetch rejects with a generic FetchError', async () => {
    global.fetch = hangingFetch(
      () => new ExpoFetchError('The operation was aborted.'),
    ) as unknown as typeof fetch;

    const request = fetchWithTimeout('https://example.com', 1000);
    jest.advanceTimersByTime(1000);

    const error = await request.catch((e: unknown) => e);
    expect(isTimeoutError(error)).toBe(true);
  });

  it('should report a timeout when fetch rejects with a standard AbortError', async () => {
    global.fetch = hangingFetch(() => {
      const error = new Error('The operation was aborted');
      error.name = 'AbortError';
      return error;
    }) as unknown as typeof fetch;

    const request = fetchWithTimeout('https://example.com', 1000);
    jest.advanceTimersByTime(1000);

    const error = await request.catch((e: unknown) => e);
    expect(isTimeoutError(error)).toBe(true);
  });

  it('should pass through network errors that happen before the timeout', async () => {
    const networkError = new ExpoFetchError('Network request failed');
    global.fetch = jest.fn(() => Promise.reject(networkError));

    const error = await fetchWithTimeout('https://example.com', 1000).catch(
      (e: unknown) => e,
    );
    expect(error).toBe(networkError);
    expect(isTimeoutError(error)).toBe(false);
  });

  it('should clear its timer once fetch settles', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: true } as Response));

    await fetchWithTimeout('https://example.com', 1000);
    expect(jest.getTimerCount()).toBe(0);
  });
});

describe('isTimeoutError', () => {
  it('should return false for non-Error values', () => {
    expect(isTimeoutError('timeout')).toBe(false);
    expect(isTimeoutError(undefined)).toBe(false);
  });
});
