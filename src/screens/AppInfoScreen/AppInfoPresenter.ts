import Constants from 'expo-constants';

export const APP_NAME = 'K-Pod';

/**
 * Gets the app version string from app.json via expo-constants.
 *
 * Reading it at runtime keeps this screen in step with the real release; a
 * hardcoded string drifted silently on every bump.
 */
export function getAppVersion(): string {
  return Constants.expoConfig?.version ?? '1.0.0';
}
