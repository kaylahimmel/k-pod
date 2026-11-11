import { renderHook, act } from '@testing-library/react-native';
import { usePlayerControlsViewModel } from '../PlayerControlsViewModel';
import { settingsStore } from '../../../stores';
import { createMockAppSettings } from '../../../__mocks__';

describe('usePlayerControlsViewModel', () => {
  beforeEach(() => {
    settingsStore.setState({ settings: createMockAppSettings() });
  });

  it('should return the current player settings and options', () => {
    const { result } = renderHook(() => usePlayerControlsViewModel());

    expect(result.current.autoPlayNext).toBe(true);
    expect(result.current.defaultSpeed).toBe(1);
    expect(result.current.skipForwardSeconds).toBe(30);
    expect(result.current.skipBackwardSeconds).toBe(15);
    expect(result.current.speedOptions).toHaveLength(7);
    expect(result.current.skipForwardOptions).toHaveLength(5);
    expect(result.current.skipBackwardOptions).toHaveLength(4);
  });

  it('should toggle auto-play next', () => {
    const { result } = renderHook(() => usePlayerControlsViewModel());

    act(() => {
      result.current.handleToggleAutoPlayNext();
    });

    expect(settingsStore.getState().settings.autoPlayNext).toBe(false);
    expect(result.current.autoPlayNext).toBe(false);
  });

  it('should save speed and skip choices', () => {
    const { result } = renderHook(() => usePlayerControlsViewModel());

    act(() => {
      result.current.handleSpeedChange(1.5);
      result.current.handleSkipForwardChange(45);
      result.current.handleSkipBackwardChange(10);
    });

    const { settings } = settingsStore.getState();
    expect(settings.defaultSpeed).toBe(1.5);
    expect(settings.skipForwardSeconds).toBe(45);
    expect(settings.skipBackwardSeconds).toBe(10);
  });
});
