import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingsScreen } from '../SettingsScreen';
import { settingsStore } from '../../../stores';
import {
  createMockNavigation,
  createMockRoute,
  createMockAppSettings,
} from '../../../__mocks__';
import { DARK_COLORS, LIGHT_COLORS } from '../../../constants';

const mockNavigationFns = createMockNavigation();
const mockNavigation = mockNavigationFns as unknown as Parameters<
  typeof SettingsScreen
>[0]['navigation'];

const mockRoute = createMockRoute('Settings') as Parameters<
  typeof SettingsScreen
>[0]['route'];

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    settingsStore.setState({
      settings: createMockAppSettings(),
    });
  });

  const renderSettingsScreen = () =>
    render(<SettingsScreen navigation={mockNavigation} route={mockRoute} />);

  describe('Rendering', () => {
    it('should render SettingsView', () => {
      const { getByText } = renderSettingsScreen();

      expect(getByText('Listening History')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it.each([
      ['Listening History', 'ListeningHistory'],
      ['Notifications', 'NotificationSettings'],
      ['Player Controls', 'PlayerControls'],
      ['Legal', 'Legal'],
      ['App Information', 'AppInfo'],
      ['Change Password', 'ChangePassword'],
    ])('should open %s in the Settings stack', (label, route) => {
      const { getByText } = renderSettingsScreen();

      fireEvent.press(getByText(label));

      expect(mockNavigationFns.navigate).toHaveBeenCalledWith(route);
    });
  });

  describe('Dark Mode', () => {
    it('saves dark and redraws in the dark palette when switched on', () => {
      const { getByLabelText } = renderSettingsScreen();
      // Jest reports a light phone, so following the phone starts light
      expect(getByLabelText('Dark Mode').props.value).toBe(false);
      expect(getByLabelText('Dark Mode').props.onTintColor).toBe(
        LIGHT_COLORS.primary,
      );

      fireEvent(getByLabelText('Dark Mode'), 'onValueChange', true);

      expect(settingsStore.getState().settings.themePreference).toBe('dark');
      expect(getByLabelText('Dark Mode').props.value).toBe(true);
      expect(getByLabelText('Dark Mode').props.onTintColor).toBe(
        DARK_COLORS.primary,
      );
    });

    it('saves light when switched off from dark', () => {
      settingsStore.getState().updateSetting('themePreference', 'dark');
      const { getByLabelText } = renderSettingsScreen();

      fireEvent(getByLabelText('Dark Mode'), 'onValueChange', false);

      expect(settingsStore.getState().settings.themePreference).toBe('light');
      expect(getByLabelText('Dark Mode').props.value).toBe(false);
    });
  });
});
