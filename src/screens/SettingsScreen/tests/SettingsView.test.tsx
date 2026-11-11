import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';
import { SettingsView } from '../SettingsView';
import { podcastStore, settingsStore } from '../../../stores';
import { createMockAppSettings, createMockPodcast } from '../../../__mocks__';

jest.spyOn(Alert, 'alert');
jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

describe('SettingsView', () => {
  const defaultSettings = createMockAppSettings();
  const mockOnNotificationsPress = jest.fn();
  const mockOnPlayerControlsPress = jest.fn();
  const mockOnLegalPress = jest.fn();
  const mockOnAppInfoPress = jest.fn();
  const mockOnListeningHistoryPress = jest.fn();
  const mockOnChangePasswordPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    settingsStore.setState({
      settings: defaultSettings,
      loading: false,
      error: null,
    });
    podcastStore.setState({ podcasts: [] });
  });

  const renderSettingsView = () =>
    render(
      <SettingsView
        onNotificationsPress={mockOnNotificationsPress}
        onPlayerControlsPress={mockOnPlayerControlsPress}
        onLegalPress={mockOnLegalPress}
        onAppInfoPress={mockOnAppInfoPress}
        onListeningHistoryPress={mockOnListeningHistoryPress}
        onChangePasswordPress={mockOnChangePasswordPress}
      />,
    );

  describe('Loading State', () => {
    it('should display loading indicator when loading', () => {
      settingsStore.setState({ loading: true });

      const { getByTestId } = renderSettingsView();

      expect(getByTestId('skeleton-list')).toBeTruthy();
    });
  });

  describe('Account Rows', () => {
    it('should open each linked screen', () => {
      const { getByText } = renderSettingsView();

      fireEvent.press(getByText('Notifications'));
      fireEvent.press(getByText('Player Controls'));
      fireEvent.press(getByText('Legal'));
      fireEvent.press(getByText('App Information'));

      expect(mockOnNotificationsPress).toHaveBeenCalledTimes(1);
      expect(mockOnPlayerControlsPress).toHaveBeenCalledTimes(1);
      expect(mockOnLegalPress).toHaveBeenCalledTimes(1);
      expect(mockOnAppInfoPress).toHaveBeenCalledTimes(1);
    });

    it('should show the Dark Mode and Download On WiFi Only switches', () => {
      const { getByLabelText } = renderSettingsView();

      expect(getByLabelText('Dark Mode')).toBeTruthy();
      expect(getByLabelText('Download On WiFi Only').props.value).toBe(true);
    });

    it('should save the download setting when its switch is flipped', () => {
      const { getByLabelText } = renderSettingsView();

      fireEvent(
        getByLabelText('Download On WiFi Only'),
        'onValueChange',
        false,
      );

      expect(settingsStore.getState().settings.downloadOnWiFi).toBe(false);
    });

    it('should keep sub-page settings and legal links off this screen', () => {
      podcastStore.setState({
        podcasts: [createMockPodcast({ id: 'p1', title: 'Podcast One' })],
      });
      const { queryByText } = renderSettingsView();

      expect(queryByText('Auto-play next episode')).toBeNull();
      expect(queryByText('Skip Forward')).toBeNull();
      expect(queryByText('Privacy Policy')).toBeNull();
      expect(queryByText('K-Pod')).toBeNull();
      expect(queryByText('Podcast One')).toBeNull();
    });
  });

  describe('Reset Settings', () => {
    it('should display the Reset All Settings row', () => {
      const { getByText } = renderSettingsView();

      expect(getByText('Reset All Settings')).toBeTruthy();
    });

    it('should show confirmation alert when reset is pressed', () => {
      const { getByText } = renderSettingsView();

      fireEvent.press(getByText('Reset All Settings'));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Reset Settings',
        'Are you sure you want to reset all settings to their defaults?',
        expect.any(Array),
      );
    });

    it('should call resetSettings when confirmed', async () => {
      const resetSettingsSpy = jest.fn();
      settingsStore.setState({
        settings: defaultSettings,
        loading: false,
        error: null,
        resetSettings: resetSettingsSpy,
      });

      const { getByText } = renderSettingsView();

      fireEvent.press(getByText('Reset All Settings'));

      // Get the Reset button from the alert and press it
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const resetButton = alertCall[2].find(
        (btn: { text: string }) => btn.text === 'Reset',
      );
      resetButton.onPress();

      await waitFor(() => {
        expect(resetSettingsSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Account Section Layout', () => {
    it('should list every row in order, ending with Reset', () => {
      const view = renderSettingsView();
      const order = [
        'Not signed in',
        'Listening Time',
        'Episodes',
        'Subscribed',
        'Listening History',
        'Notifications',
        'Dark Mode',
        'Download On WiFi Only',
        'Player Controls',
        'Legal',
        'App Information',
        'Change Password',
        'Sign Out',
        'Reset All Settings',
      ];

      // The serialized tree is in screen order, so positions must ascend
      const screen = JSON.stringify(view.toJSON());
      const positions = order.map((text) => screen.indexOf(`"${text}"`));

      expect(positions).not.toContain(-1);
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
    });

    it('should have no section headers', () => {
      const { queryByText } = renderSettingsView();

      for (const header of [
        'Account',
        'Appearance',
        'Downloads',
        'Player Settings',
        'Listening',
      ]) {
        expect(queryByText(header)).toBeNull();
      }
    });

    it('should open Listening History and Change Password', () => {
      const { getByText } = renderSettingsView();

      fireEvent.press(getByText('Listening History'));
      fireEvent.press(getByText('Change Password'));

      expect(mockOnListeningHistoryPress).toHaveBeenCalledTimes(1);
      expect(mockOnChangePasswordPress).toHaveBeenCalledTimes(1);
    });

    it('should ask for confirmation before signing out', () => {
      const { getByText } = renderSettingsView();

      fireEvent.press(getByText('Sign Out'));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Sign Out',
        'Are you sure you want to sign out?',
        expect.any(Array),
      );
    });
  });
});
