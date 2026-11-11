import React from 'react';
import { render } from '@testing-library/react-native';
import { SettingAccountHeader } from '../SettingAccountHeader';

describe('SettingAccountHeader', () => {
  it('shows the initials and email', () => {
    const { getByText } = render(
      <SettingAccountHeader initials='KH' email='kayla@example.com' />,
    );

    expect(getByText('KH')).toBeTruthy();
    expect(getByText('kayla@example.com')).toBeTruthy();
  });
});
