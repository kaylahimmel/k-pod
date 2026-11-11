import React from 'react';
import { render } from '@testing-library/react-native';
import { AppInfoScreen } from '../AppInfoScreen';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '3.2.0' } },
}));

describe('AppInfoScreen', () => {
  it('should show the app name and the version from app.json', () => {
    const { getByText } = render(<AppInfoScreen />);

    expect(getByText('K-Pod')).toBeTruthy();
    expect(getByText('Version 3.2.0')).toBeTruthy();
  });
});
