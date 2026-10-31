/** The slice of zustand's persist API this file needs */
interface PersistApi {
  hasHydrated: () => boolean;
  rehydrate: () => Promise<void> | void;
}

/**
 * Waits for a persisted store to load from AsyncStorage.
 *
 * Reading a store before it loads sees empty state, and any write then
 * overwrites the user's saved data with it (the same bug historyStore once
 * had). `rehydrate()` resolves once loading finishes, including on failure.
 */
export async function ensureHydrated(persist: PersistApi): Promise<void> {
  if (persist.hasHydrated()) return;
  await persist.rehydrate();
}
