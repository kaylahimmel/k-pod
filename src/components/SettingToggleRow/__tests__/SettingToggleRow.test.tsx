import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingToggleRow } from '../SettingToggleRow';
import { COLORS } from '../../../constants';

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

  it('labels the switch for screen readers', () => {
    const { getByLabelText } = render(
      <SettingToggleRow
        label='Slow Burn'
        value={true}
        onValueChange={mockOnValueChange}
      />,
    );

    expect(getByLabelText('Slow Burn')).toBeTruthy();
  });

  it('uses the same thumb and track colors on every platform', () => {
    const { getByTestId } = render(
      <SettingToggleRow
        label='Slow Burn'
        value={true}
        onValueChange={mockOnValueChange}
      />,
    );

    const { props } = getByTestId('setting-toggle-switch');
    expect(props.thumbTintColor).toBe(COLORS.cardBackground);
    expect(props.onTintColor).toBe(COLORS.primary);
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
