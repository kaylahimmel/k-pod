import React from 'react';
import { render } from '@testing-library/react-native';
import { StateNoResults } from '../StateNoResults';

describe('StateNoResults', () => {
  it('renders no results title', () => {
    const { getByText } = render(<StateNoResults query='podcast name' />);

    expect(getByText('No Results')).toBeTruthy();
  });

  it('renders message with query', () => {
    const { getByText } = render(<StateNoResults query='podcast name' />);

    expect(getByText('No podcasts found matching podcast name')).toBeTruthy();
  });

  it('renders with default search icon', () => {
    const { toJSON } = render(<StateNoResults query='test' />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom icon', () => {
    const { toJSON } = render(
      <StateNoResults query='test' icon='mic-outline' />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders with different query values', () => {
    const { getByText } = render(<StateNoResults query='technology' />);

    expect(getByText('No podcasts found matching technology')).toBeTruthy();
  });

  it('handles special characters in query', () => {
    const { getByText } = render(<StateNoResults query='test & demo' />);

    expect(getByText('No podcasts found matching test & demo')).toBeTruthy();
  });
});
