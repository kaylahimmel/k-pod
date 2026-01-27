import React from 'react';
import { render } from '@testing-library/react-native';
import { EpisodesEmpty } from '../EpisodesEmpty';

describe('EpisodesEmpty', () => {
  it('renders empty state', () => {
    const { toJSON } = render(<EpisodesEmpty />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays empty title', () => {
    const { getByText } = render(<EpisodesEmpty />);
    expect(getByText('No Episodes')).toBeTruthy();
  });

  it('displays empty message', () => {
    const { getByText } = render(<EpisodesEmpty />);
    expect(
      getByText('This podcast does not have any episodes yet'),
    ).toBeTruthy();
  });
});
