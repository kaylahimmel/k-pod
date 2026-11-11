import { PlaybackSpeed } from '../../models';

export interface SpeedOption {
  value: PlaybackSpeed;
  label: string;
}

export interface SkipOption {
  value: number;
  label: string;
}

export interface PlayerControlsViewModelReturn {
  autoPlayNext: boolean;
  defaultSpeed: PlaybackSpeed;
  skipForwardSeconds: number;
  skipBackwardSeconds: number;
  speedOptions: SpeedOption[];
  skipForwardOptions: SkipOption[];
  skipBackwardOptions: SkipOption[];
  handleToggleAutoPlayNext: () => void;
  handleSpeedChange: (speed: PlaybackSpeed) => void;
  handleSkipForwardChange: (seconds: number) => void;
  handleSkipBackwardChange: (seconds: number) => void;
}
