import {
  formatPlaybackSpeed,
  formatSkipDuration,
  formatSettings,
  getAppVersion,
  SPEED_OPTIONS,
  SKIP_FORWARD_OPTIONS,
  SKIP_BACKWARD_OPTIONS,
} from '../SettingsPresenter';
import { AppSettings } from '../../../models';

describe('SettingsPresenter', () => {
  describe('SPEED_OPTIONS', () => {
    it('should have expected speed options', () => {
      expect(SPEED_OPTIONS).toHaveLength(7);
      expect(SPEED_OPTIONS[0]).toEqual({ value: 0.5, label: '0.5x' });
      expect(SPEED_OPTIONS[2]).toEqual({ value: 1, label: '1x (Normal)' });
      expect(SPEED_OPTIONS[6]).toEqual({ value: 2, label: '2x' });
    });
  });

  describe('SKIP_FORWARD_OPTIONS', () => {
    it('should have expected skip forward options', () => {
      expect(SKIP_FORWARD_OPTIONS).toHaveLength(5);
      expect(SKIP_FORWARD_OPTIONS[0]).toEqual({
        value: 10,
        label: '10 seconds',
      });
      expect(SKIP_FORWARD_OPTIONS[2]).toEqual({
        value: 30,
        label: '30 seconds',
      });
    });
  });

  describe('SKIP_BACKWARD_OPTIONS', () => {
    it('should have expected skip backward options', () => {
      expect(SKIP_BACKWARD_OPTIONS).toHaveLength(4);
      expect(SKIP_BACKWARD_OPTIONS[0]).toEqual({
        value: 5,
        label: '5 seconds',
      });
      expect(SKIP_BACKWARD_OPTIONS[2]).toEqual({
        value: 15,
        label: '15 seconds',
      });
    });
  });

  describe('formatPlaybackSpeed', () => {
    it('should return label for known speed options', () => {
      expect(formatPlaybackSpeed(1)).toBe('1x (Normal)');
      expect(formatPlaybackSpeed(1.5)).toBe('1.5x');
      expect(formatPlaybackSpeed(2)).toBe('2x');
      expect(formatPlaybackSpeed(0.5)).toBe('0.5x');
    });

    it('should format unknown speeds with x suffix', () => {
      expect(formatPlaybackSpeed(1.1)).toBe('1.1x');
      expect(formatPlaybackSpeed(3)).toBe('3x');
    });
  });

  describe('formatSkipDuration', () => {
    it('should format duration with sec suffix', () => {
      expect(formatSkipDuration(10)).toBe('10 sec');
      expect(formatSkipDuration(30)).toBe('30 sec');
      expect(formatSkipDuration(60)).toBe('60 sec');
    });
  });

  describe('formatSettings', () => {
    it('should format all settings correctly', () => {
      const settings: AppSettings = {
        autoPlayNext: true,
        defaultSpeed: 1.5,
        downloadOnWiFi: false,
        skipForwardSeconds: 30,
        skipBackwardSeconds: 15,
      };

      const formatted = formatSettings(settings);

      expect(formatted.autoPlayNext).toBe(true);
      expect(formatted.defaultSpeed).toBe(1.5);
      expect(formatted.defaultSpeedLabel).toBe('1.5x');
      expect(formatted.downloadOnWiFi).toBe(false);
      expect(formatted.skipForwardSeconds).toBe(30);
      expect(formatted.skipForwardLabel).toBe('30 sec');
      expect(formatted.skipBackwardSeconds).toBe(15);
      expect(formatted.skipBackwardLabel).toBe('15 sec');
    });

    it('should handle default settings', () => {
      const defaultSettings: AppSettings = {
        autoPlayNext: true,
        defaultSpeed: 1,
        downloadOnWiFi: true,
        skipForwardSeconds: 30,
        skipBackwardSeconds: 15,
      };

      const formatted = formatSettings(defaultSettings);

      expect(formatted.defaultSpeedLabel).toBe('1x (Normal)');
    });
  });

  describe('getAppVersion', () => {
    it('should return a version string', () => {
      const version = getAppVersion();
      expect(typeof version).toBe('string');
      expect(version).toBe('1.0.0');
    });
  });
});
