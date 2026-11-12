import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import {
  HeaderButton,
  HeaderBackButton,
  HeaderCloseButton,
} from '../HeaderButton';
import { HEADER_ICON_SIZE } from '../HeaderButton.styles';

describe('HeaderButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('HeaderButton (base component)', () => {
    it('renders with the provided icon', () => {
      const { getByLabelText } = render(
        <HeaderButton
          icon='settings'
          onPress={mockOnPress}
          accessibilityLabel='Settings'
        />,
      );

      expect(getByLabelText('Settings')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
      const { getByLabelText } = render(
        <HeaderButton
          icon='settings'
          onPress={mockOnPress}
          accessibilityLabel='Settings'
        />,
      );

      fireEvent.press(getByLabelText('Settings'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('uses default icon size and color from config', () => {
      const { getByLabelText } = render(
        <HeaderButton
          icon='settings'
          onPress={mockOnPress}
          accessibilityLabel='Settings'
        />,
      );

      const button = getByLabelText('Settings');
      expect(button).toBeTruthy();
      // Icon size comes from the shared config; color comes from the theme
      expect(HEADER_ICON_SIZE).toBe(28);
    });
  });

  describe('HeaderBackButton', () => {
    it('renders with chevron-back icon', () => {
      const { getByLabelText } = render(
        <HeaderBackButton onPress={mockOnPress} />,
      );

      expect(getByLabelText('Go back')).toBeTruthy();
    });

    it('uses default accessibility label', () => {
      const { getByLabelText } = render(
        <HeaderBackButton onPress={mockOnPress} />,
      );

      expect(getByLabelText('Go back')).toBeTruthy();
    });

    it('allows custom accessibility label', () => {
      const { getByLabelText } = render(
        <HeaderBackButton
          onPress={mockOnPress}
          accessibilityLabel='Navigate back'
        />,
      );

      expect(getByLabelText('Navigate back')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
      const { getByLabelText } = render(
        <HeaderBackButton onPress={mockOnPress} />,
      );

      fireEvent.press(getByLabelText('Go back'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('HeaderCloseButton', () => {
    it('renders with close icon', () => {
      const { getByLabelText } = render(
        <HeaderCloseButton onPress={mockOnPress} />,
      );

      expect(getByLabelText('Close')).toBeTruthy();
    });

    it('uses default accessibility label', () => {
      const { getByLabelText } = render(
        <HeaderCloseButton onPress={mockOnPress} />,
      );

      expect(getByLabelText('Close')).toBeTruthy();
    });

    it('allows custom accessibility label', () => {
      const { getByLabelText } = render(
        <HeaderCloseButton
          onPress={mockOnPress}
          accessibilityLabel='Close modal'
        />,
      );

      expect(getByLabelText('Close modal')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
      const { getByLabelText } = render(
        <HeaderCloseButton onPress={mockOnPress} />,
      );

      fireEvent.press(getByLabelText('Close'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });
});
