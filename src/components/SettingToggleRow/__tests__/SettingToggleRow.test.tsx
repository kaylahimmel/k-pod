import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingToggleRow } from '../SettingToggleRow';

describe('SettingToggleRow', () => {
  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders label correctly', () => {
    const { getByText } = render(
      <SettingToggleRow
        label='Auto-play next episode'
        value={true}
        onValueChange={mockOnValueChange}
      />,
    );

    expect(getByText('Auto-play next episode')).toBeTruthy();
  });

  it('calls onValueChange when switch is toggled', () => {
    const { getByTestId } = render(
      <SettingToggleRow
        label='Auto-play next episode'
        value={false}
        onValueChange={mockOnValueChange}
      />,
    );

    const switchComponent = getByTestId('setting-toggle-switch');
    fireEvent(switchComponent, 'onValueChange', true);
    expect(mockOnValueChange).toHaveBeenCalledTimes(1);
  });

  it('renders without last item styling by default', () => {
    const { toJSON } = render(
      <SettingToggleRow
        label='Auto-play next episode'
        value={true}
        onValueChange={mockOnValueChange}
      />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with last item styling when isLast is true', () => {
    const { toJSON } = render(
      <SettingToggleRow
        label='Auto-play next episode'
        value={true}
        onValueChange={mockOnValueChange}
        isLast={true}
      />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with value set to false', () => {
    const { toJSON } = render(
      <SettingToggleRow
        label='Notifications'
        value={false}
        onValueChange={mockOnValueChange}
      />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with different labels', () => {
    const { getByText } = render(
      <SettingToggleRow
        label='Dark Mode'
        value={true}
        onValueChange={mockOnValueChange}
      />,
    );

    expect(getByText('Dark Mode')).toBeTruthy();
  });
});
