import { PlaybackSpeed } from '../../models';
import { SettingOption } from '../../components';

export interface PlayerControlsViewModelReturn {
  autoPlayNext: boolean;
  defaultSpeed: PlaybackSpeed;
  skipForwardSeconds: number;
  skipBackwardSeconds: number;
  speedOptions: SettingOption<PlaybackSpeed>[];
  skipForwardOptions: SettingOption<number>[];
  skipBackwardOptions: SettingOption<number>[];
  handleToggleAutoPlayNext: () => void;
  handleSpeedChange: (speed: PlaybackSpeed) => void;
  handleSkipForwardChange: (seconds: number) => void;
  handleSkipBackwardChange: (seconds: number) => void;
}
