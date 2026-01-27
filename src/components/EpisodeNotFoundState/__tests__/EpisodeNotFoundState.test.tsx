import React from 'react';
import { render } from '@testing-library/react-native';
import { EpisodeNotFoundState } from '../EpisodeNotFoundState';

describe('EpisodeNotFoundState', () => {
  it('renders not found state', () => {
    const { toJSON } = render(<EpisodeNotFoundState />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays error title', () => {
    const { getByText } = render(<EpisodeNotFoundState />);
    expect(getByText('Podcast Not Found')).toBeTruthy();
  });

  it('displays error message', () => {
    const { getByText } = render(<EpisodeNotFoundState />);
    expect(
      getByText('This podcast may have been removed from your library'),
    ).toBeTruthy();
  });
});
