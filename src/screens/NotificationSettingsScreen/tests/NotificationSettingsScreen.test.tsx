import React from 'react';
import { render } from '@testing-library/react-native';
import { NotificationSettingsScreen } from '../NotificationSettingsScreen';

describe('NotificationSettingsScreen', () => {
  it('should render the view', async () => {
    const { findByText } = render(<NotificationSettingsScreen />);

    expect(await findByText('New episode alerts')).toBeTruthy();
  });
});
