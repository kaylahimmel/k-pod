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
      loading: false,
      error: null,
    });
  });

  const renderSettingsScreen = () =>
    render(<SettingsScreen navigation={mockNavigation} route={mockRoute} />);

  describe('Rendering', () => {
    it('should render SettingsView', () => {
      const { getByText } = renderSettingsScreen();

      expect(getByText('Listening History')).toBeTruthy();
    });

    it('should display the reset settings row', () => {
      const { getByText } = renderSettingsScreen();

      expect(getByText('Reset All Settings')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should open the notification settings', () => {
      const { getByText } = renderSettingsScreen();

      fireEvent.press(getByText('Notifications'));

      expect(mockNavigationFns.navigate).toHaveBeenCalledWith(
        'NotificationSettings',
      );
    });

    it('should open the Player Controls and App Information screens', () => {
      const { getByText } = renderSettingsScreen();

      fireEvent.press(getByText('Player Controls'));
      expect(mockNavigationFns.navigate).toHaveBeenCalledWith('PlayerControls');

      fireEvent.press(getByText('App Information'));
      expect(mockNavigationFns.navigate).toHaveBeenCalledWith('AppInfo');
    });

    it('should open the Legal screen', () => {
      const { getByText } = renderSettingsScreen();

      fireEvent.press(getByText('Legal'));
      expect(mockNavigationFns.navigate).toHaveBeenCalledWith('Legal');
    });

    it('should open Listening History and Change Password in the Settings stack', () => {
      const { getByText } = renderSettingsScreen();

      fireEvent.press(getByText('Listening History'));
      expect(mockNavigationFns.navigate).toHaveBeenCalledWith(
        'ListeningHistory',
      );

      fireEvent.press(getByText('Change Password'));
      expect(mockNavigationFns.navigate).toHaveBeenCalledWith('ChangePassword');
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
