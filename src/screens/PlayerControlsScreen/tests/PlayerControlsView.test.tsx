import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PlayerControlsScreen } from '../PlayerControlsScreen';
import { settingsStore } from '../../../stores';
import { createMockAppSettings } from '../../../__mocks__';

describe('PlayerControlsScreen', () => {
  beforeEach(() => {
    settingsStore.setState({ settings: createMockAppSettings() });
  });

  it('should show all four settings in order, in title case', () => {
    const view = render(<PlayerControlsScreen />);
    const order = [
      'Auto-Play Next Episode',
      'Playback Speed',
      'Skip Forward',
      'Skip Backward',
    ];

    // The serialized tree is in screen order, so positions must ascend
    const screen = JSON.stringify(view.toJSON());
    const positions = order.map((text) => screen.indexOf(`"${text}"`));

    expect(positions).not.toContain(-1);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('should not show current-value labels next to the pickers', () => {
    const { queryByText, getAllByText } = render(<PlayerControlsScreen />);

    // Only the 1x button itself, no separate "1x (Normal)" value label
    expect(getAllByText('1x (Normal)')).toHaveLength(1);
    expect(queryByText('30 sec')).toBeNull();
    expect(queryByText('15 sec')).toBeNull();
  });

  it('should save each setting when changed', () => {
    const { getByText, getByLabelText } = render(<PlayerControlsScreen />);

    fireEvent(getByLabelText('Auto-Play Next Episode'), 'onValueChange', false);
    fireEvent.press(getByText('1.75x'));
    // 60 seconds is only a forward option, 5 seconds only a backward one
    fireEvent.press(getByText('60 seconds'));
    fireEvent.press(getByText('5 seconds'));

    const { settings } = settingsStore.getState();
    expect(settings.autoPlayNext).toBe(false);
    expect(settings.defaultSpeed).toBe(1.75);
    expect(settings.skipForwardSeconds).toBe(60);
    expect(settings.skipBackwardSeconds).toBe(5);
  });
});
