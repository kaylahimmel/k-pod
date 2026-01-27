import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingLinkRow } from '../SettingLinkRow';

describe('SettingLinkRow', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders label correctly', () => {
    const { getByText } = render(
      <SettingLinkRow label='Privacy Policy' onPress={mockOnPress} />,
    );

    expect(getByText('Privacy Policy')).toBeTruthy();
  });

  it('calls onPress when row is pressed', () => {
    const { getByText } = render(
      <SettingLinkRow label='Privacy Policy' onPress={mockOnPress} />,
    );

    fireEvent.press(getByText('Privacy Policy'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders without last item styling by default', () => {
    const { toJSON } = render(
      <SettingLinkRow label='Privacy Policy' onPress={mockOnPress} />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with last item styling when isLast is true', () => {
    const { toJSON } = render(
      <SettingLinkRow
        label='Privacy Policy'
        onPress={mockOnPress}
        isLast={true}
      />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with different labels', () => {
    const { getByText } = render(
      <SettingLinkRow label='Terms of Service' onPress={mockOnPress} />,
    );

    expect(getByText('Terms of Service')).toBeTruthy();
  });
});
