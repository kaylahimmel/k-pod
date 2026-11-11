import { useCallback } from 'react';
import { PlaybackSpeed } from '../../models';
import { useSettingsStore } from '../../hooks';
import {
  SKIP_BACKWARD_OPTIONS,
  SKIP_FORWARD_OPTIONS,
  SPEED_OPTIONS,
} from './PlayerControlsPresenter';
import { PlayerControlsViewModelReturn } from './PlayerControls.types';

/**
 * ViewModel hook for the Player Controls screen (opened from Settings).
 * Reads and writes the same settingsStore fields the player uses: auto-play,
 * the default speed for the next episode that loads, and the skip buttons'
 * jump sizes
 */
export const usePlayerControlsViewModel = (): PlayerControlsViewModelReturn => {
  const { settings, updateSetting } = useSettingsStore();

  /**
   * Toggles the auto-play next episode setting
   */
  const handleToggleAutoPlayNext = useCallback(() => {
    updateSetting('autoPlayNext', !settings.autoPlayNext);
  }, [settings.autoPlayNext, updateSetting]);

  /**
   * Updates the default playback speed
   */
  const handleSpeedChange = useCallback(
    (speed: PlaybackSpeed) => {
      updateSetting('defaultSpeed', speed);
    },
    [updateSetting],
  );

  /**
   * Updates the skip forward duration
   */
  const handleSkipForwardChange = useCallback(
    (seconds: number) => {
      updateSetting('skipForwardSeconds', seconds);
    },
    [updateSetting],
  );

  /**
   * Updates the skip backward duration
   */
  const handleSkipBackwardChange = useCallback(
    (seconds: number) => {
      updateSetting('skipBackwardSeconds', seconds);
    },
    [updateSetting],
  );

  return {
    autoPlayNext: settings.autoPlayNext,
    defaultSpeed: settings.defaultSpeed,
    skipForwardSeconds: settings.skipForwardSeconds,
    skipBackwardSeconds: settings.skipBackwardSeconds,
    speedOptions: SPEED_OPTIONS,
    skipForwardOptions: SKIP_FORWARD_OPTIONS,
    skipBackwardOptions: SKIP_BACKWARD_OPTIONS,
    handleToggleAutoPlayNext,
    handleSpeedChange,
    handleSkipForwardChange,
    handleSkipBackwardChange,
  };
};
