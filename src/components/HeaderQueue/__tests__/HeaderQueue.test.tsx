import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HeaderQueue } from '../HeaderQueue';

describe('HeaderQueue', () => {
  const mockOnClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders queue stats correctly', () => {
    const { getByText } = render(
      <HeaderQueue
        count='5 episodes'
        remainingTime='2h 30m remaining'
        onClear={mockOnClear}
        hasItems={true}
      />,
    );

    expect(getByText('5 episodes')).toBeTruthy();
    expect(getByText('2h 30m remaining')).toBeTruthy();
  });

  it('shows clear button when hasItems is true', () => {
    const { getByText } = render(
      <HeaderQueue
        count='5 episodes'
        remainingTime='2h 30m remaining'
        onClear={mockOnClear}
        hasItems={true}
      />,
    );

    expect(getByText('Clear')).toBeTruthy();
  });

  it('hides clear button when hasItems is false', () => {
    const { queryByText } = render(
      <HeaderQueue
        count='0 episodes'
        remainingTime='0m remaining'
        onClear={mockOnClear}
        hasItems={false}
      />,
    );

    expect(queryByText('Clear')).toBeNull();
  });

  it('calls onClear when clear button is pressed', () => {
    const { getByText } = render(
      <HeaderQueue
        count='5 episodes'
        remainingTime='2h 30m remaining'
        onClear={mockOnClear}
        hasItems={true}
      />,
    );

    fireEvent.press(getByText('Clear'));
    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });

  it('renders with different count values', () => {
    const { getByText } = render(
      <HeaderQueue
        count='1 episode'
        remainingTime='45m remaining'
        onClear={mockOnClear}
        hasItems={true}
      />,
    );

    expect(getByText('1 episode')).toBeTruthy();
    expect(getByText('45m remaining')).toBeTruthy();
  });
});
