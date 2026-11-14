import { APP_NAME, getAppVersion } from './AppInfoPresenter';
import { AppInfoViewModelReturn } from './AppInfo.types';

/**
 * ViewModel hook for the App Information screen (opened from Settings).
 * TO-DO: once the app is on the App Store, add plain-language release notes
 * here and keep them updated with each release
 */
export const useAppInfoViewModel = (): AppInfoViewModelReturn => {
  return { appName: APP_NAME, appVersion: getAppVersion() };
};
