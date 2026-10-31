import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NotificationSettingsScreen } from '../NotificationSettingsScreen';
import { createMockNavigation, createMockRoute } from '../../../__mocks__';

const mockNavigation = createMockNavigation();

const renderScreen = () =>
  render(
    <NotificationSettingsScreen
      navigation={
        mockNavigation as unknown as Parameters<
          typeof NotificationSettingsScreen
        >[0]['navigation']
      }
      route={
        createMockRoute('NotificationSettings') as Parameters<
          typeof NotificationSettingsScreen
        >[0]['route']
      }
    />,
  );

describe('NotificationSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the view', async () => {
    const { findByText } = renderScreen();

    expect(await findByText('New episode alerts')).toBeTruthy();
  });

  it('should close the modal from the header button', async () => {
    const { findByText } = renderScreen();
    await findByText('New episode alerts');

    const { headerLeft } = mockNavigation.setOptions.mock.calls[0][0];
    const { getByLabelText } = render(headerLeft());
    fireEvent.press(getByLabelText('Close'));

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
