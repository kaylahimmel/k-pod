import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Animated, StyleSheet } from 'react-native';
import { Toast } from '../Toast';

describe('Toast', () => {
  const mockOnDismiss = jest.fn();
  const translateY = new Animated.Value(0);
  const opacity = new Animated.Value(1);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when not visible', () => {
    const { toJSON } = render(
      <Toast
        message='Test message'
        visible={false}
        translateY={translateY}
        opacity={opacity}
        onDismiss={mockOnDismiss}
      />,
    );

    expect(toJSON()).toBeNull();
  });

  it('renders message when visible', () => {
    const { getByText } = render(
      <Toast
        message='Added to queue'
        visible={true}
        translateY={translateY}
        opacity={opacity}
        onDismiss={mockOnDismiss}
      />,
    );

    expect(getByText('Added to queue')).toBeTruthy();
  });

  it('calls onDismiss when close button is pressed', () => {
    const { getByTestId } = render(
      <Toast
        message='Test message'
        visible={true}
        translateY={translateY}
        opacity={opacity}
        onDismiss={mockOnDismiss}
      />,
    );

    fireEvent.press(getByTestId('toast-close-button'));
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders with different messages', () => {
    const { getByText } = render(
      <Toast
        message='Subscribed successfully'
        visible={true}
        translateY={translateY}
        opacity={opacity}
        onDismiss={mockOnDismiss}
      />,
    );

    expect(getByText('Subscribed successfully')).toBeTruthy();
  });

  it('renders toast container with animated styles', () => {
    const { toJSON } = render(
      <Toast
        message='Test message'
        visible={true}
        translateY={translateY}
        opacity={opacity}
        onDismiss={mockOnDismiss}
      />,
    );

    expect(toJSON()).toBeTruthy();
  });

  const getContainerBottom = (bottomOffset?: number) => {
    const { getByTestId } = render(
      <Toast
        message='Added to queue'
        visible={true}
        translateY={translateY}
        opacity={opacity}
        onDismiss={mockOnDismiss}
        bottomOffset={bottomOffset}
      />,
    );
    return StyleSheet.flatten(getByTestId('toast-container').props.style)
      .bottom;
  };

  it('sits 8px above the bottom of the screen area by default', () => {
    expect(getContainerBottom()).toBe(8);
  });

  it('uses bottomOffset on screens without a mini player', () => {
    expect(getContainerBottom(42)).toBe(42);
  });
});
