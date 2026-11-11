import Constants from 'expo-constants';
import { APP_NAME, getAppVersion } from '../AppInfoPresenter';

// expoConfig is a non-configurable getter on the real module, so jest.spyOn
// can't wrap it - mock the module and mutate the plain object instead
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '1.0.0' } },
}));

type MutableConstants = { expoConfig: { version?: string } | null };
const mockConstants = Constants as unknown as MutableConstants;

describe('AppInfoPresenter', () => {
  it('should name the app', () => {
    expect(APP_NAME).toBe('K-Pod');
  });

  describe('getAppVersion', () => {
    it('should read the version from expo-constants, not a hardcoded string', () => {
      // Hardcoding meant the screen silently drifted from app.json on every
      // release bump
      mockConstants.expoConfig = { version: '2.4.1' };

      expect(getAppVersion()).toBe('2.4.1');
    });

    it('should fall back to a placeholder when no version is configured', () => {
      mockConstants.expoConfig = null;

      expect(getAppVersion()).toBe('1.0.0');
    });
  });
});
