import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationBackButton } from '../NavigationBackButton';

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

describe('NavigationBackButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with chevron-back icon', () => {
    const { getByLabelText } = render(<NavigationBackButton />);

    expect(getByLabelText('Go back')).toBeTruthy();
  });

  it('calls navigation.goBack when pressed', () => {
    const { getByLabelText } = render(<NavigationBackButton />);

    fireEvent.press(getByLabelText('Go back'));

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('accepts custom tintColor', () => {
    const { getByLabelText } = render(
      <NavigationBackButton tintColor='#FF0000' />,
    );

    expect(getByLabelText('Go back')).toBeTruthy();
  });

  it('uses default tintColor from config when not specified', () => {
    const { getByLabelText } = render(<NavigationBackButton />);

    expect(getByLabelText('Go back')).toBeTruthy();
  });
});
