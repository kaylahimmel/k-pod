import React from 'react';
import { render } from '@testing-library/react-native';
import { EpisodeLoadingState } from '../EpisodeLoadingState';

describe('EpisodeLoadingState', () => {
  it('renders loading indicator', () => {
    const { toJSON } = render(<EpisodeLoadingState />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays loading message', () => {
    const { getByText } = render(<EpisodeLoadingState />);
    expect(getByText('Loading podcast...')).toBeTruthy();
  });
});
