import { AppSettings } from '../models';

/**
 * Creates a mock AppSettings object for testing
 *
 * Defaults mirror `defaultSettings` in settingsStore so tests start from the
 * same state a fresh install would have.
 *
 * Prefer this over inline object literals: `defaultSpeed` is the PlaybackSpeed
 * literal union, and TypeScript widens a literal like `1` to `number` inside a
 * plain object, which no longer satisfies AppSettings. Building settings here
 * keeps the narrow type and means a future AppSettings field is a one-line
 * change instead of an edit in every test file.
 *
 * @param overrides - Optional partial AppSettings to override default values
 */
export const createMockAppSettings = (
  overrides: Partial<AppSettings> = {},
): AppSettings => ({
  autoPlayNext: true,
  defaultSpeed: 1,
  downloadOnWiFi: true,
  skipForwardSeconds: 30,
  skipBackwardSeconds: 15,
  ...overrides,
});
