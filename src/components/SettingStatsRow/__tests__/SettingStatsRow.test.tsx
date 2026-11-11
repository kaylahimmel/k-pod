import React from 'react';
import { render } from '@testing-library/react-native';
import { SettingStatsRow } from '../SettingStatsRow';

describe('SettingStatsRow', () => {
  it('shows each stat value with its label', () => {
    const { getByText } = render(
      <SettingStatsRow
        stats={[
          { label: 'Listening Time', value: '2h 5m' },
          { label: 'Episodes', value: 12 },
        ]}
      />,
    );

    expect(getByText('Listening Time')).toBeTruthy();
    expect(getByText('2h 5m')).toBeTruthy();
    expect(getByText('Episodes')).toBeTruthy();
    expect(getByText('12')).toBeTruthy();
  });
});
