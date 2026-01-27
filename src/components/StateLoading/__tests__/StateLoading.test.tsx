import React from 'react';
import { render } from '@testing-library/react-native';
import { StateLoading } from '../StateLoading';

describe('StateLoading', () => {
  it('renders with default message', () => {
    const { getByText } = render(<StateLoading />);

    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders with custom message', () => {
    const { getByText } = render(
      <StateLoading message='Loading podcasts...' />,
    );

    expect(getByText('Loading podcasts...')).toBeTruthy();
  });

  it('renders loading indicator', () => {
    const { toJSON } = render(<StateLoading />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with different custom messages', () => {
    const { getByText } = render(
      <StateLoading message='Fetching episodes...' />,
    );

    expect(getByText('Fetching episodes...')).toBeTruthy();
  });
});
