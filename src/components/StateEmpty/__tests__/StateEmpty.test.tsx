import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StateEmpty } from '../StateEmpty';

describe('StateEmpty', () => {
  const mockOnButtonPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and message correctly', () => {
    const { getByText } = render(
      <StateEmpty
        icon='library-outline'
        title='No Podcasts'
        message='Add your first podcast to start listening'
      />,
    );

    expect(getByText('No Podcasts')).toBeTruthy();
    expect(getByText('Add your first podcast to start listening')).toBeTruthy();
  });

  it('renders button when buttonText and onButtonPress are provided', () => {
    const { getByText } = render(
      <StateEmpty
        icon='library-outline'
        title='No Podcasts'
        message='Add your first podcast'
        buttonText='Add Podcast'
        onButtonPress={mockOnButtonPress}
      />,
    );

    expect(getByText('Add Podcast')).toBeTruthy();
  });

  it('does not render button when buttonText is not provided', () => {
    const { queryByText } = render(
      <StateEmpty
        icon='library-outline'
        title='No Podcasts'
        message='Add your first podcast'
      />,
    );

    expect(queryByText('Add Podcast')).toBeNull();
  });

  it('does not render button when onButtonPress is not provided', () => {
    const { queryByText } = render(
      <StateEmpty
        icon='library-outline'
        title='No Podcasts'
        message='Add your first podcast'
        buttonText='Add Podcast'
      />,
    );

    expect(queryByText('Add Podcast')).toBeNull();
  });

  it('calls onButtonPress when button is pressed', () => {
    const { getByText } = render(
      <StateEmpty
        icon='library-outline'
        title='No Podcasts'
        message='Add your first podcast'
        buttonText='Add Podcast'
        onButtonPress={mockOnButtonPress}
      />,
    );

    fireEvent.press(getByText('Add Podcast'));
    expect(mockOnButtonPress).toHaveBeenCalledTimes(1);
  });

  it('renders with button icon', () => {
    const { toJSON } = render(
      <StateEmpty
        icon='library-outline'
        title='No Podcasts'
        message='Add your first podcast'
        buttonText='Add Podcast'
        buttonIcon='add'
        onButtonPress={mockOnButtonPress}
      />,
    );

    expect(toJSON()).toBeTruthy();
  });
});
