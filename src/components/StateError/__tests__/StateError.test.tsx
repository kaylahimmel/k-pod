import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StateError } from '../StateError';

describe('StateError', () => {
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders error title', () => {
    const { getByText } = render(
      <StateError message='Failed to load podcasts' onRetry={mockOnRetry} />,
    );

    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('renders error message', () => {
    const { getByText } = render(
      <StateError message='Failed to load podcasts' onRetry={mockOnRetry} />,
    );

    expect(getByText('Failed to load podcasts')).toBeTruthy();
  });

  it('renders retry button', () => {
    const { getByText } = render(
      <StateError message='Failed to load podcasts' onRetry={mockOnRetry} />,
    );

    expect(getByText('Try Again')).toBeTruthy();
  });

  it('calls onRetry when retry button is pressed', () => {
    const { getByText } = render(
      <StateError message='Failed to load podcasts' onRetry={mockOnRetry} />,
    );

    fireEvent.press(getByText('Try Again'));
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('renders with different error messages', () => {
    const { getByText } = render(
      <StateError message='Network error occurred' onRetry={mockOnRetry} />,
    );

    expect(getByText('Network error occurred')).toBeTruthy();
  });
});
