import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingsScreen } from '../SettingsScreen';
import { settingsStore } from '../../../stores';
import { createMockNavigation, createMockRoute } from '../../../__mocks__';

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
      settings: {
        autoPlayNext: true,
        defaultSpeed: 1,
        downloadOnWiFi: true,
        skipForwardSeconds: 30,
        skipBackwardSeconds: 15,
        newEpisodeNotifications: false,
        mutedNotificationPodcastIds: [],
      },
      loading: false,
      error: null,
    });
  });

  const renderSettingsScreen = () =>
    render(<SettingsScreen navigation={mockNavigation} route={mockRoute} />);

  describe('Rendering', () => {
    it('should render SettingsView', () => {
      const { getByText } = renderSettingsScreen();

      expect(getByText('Playback')).toBeTruthy();
    });

    it('should display all settings sections', () => {
      const { getByText } = renderSettingsScreen();

      expect(getByText('Playback')).toBeTruthy();
      expect(getByText('Skip Controls')).toBeTruthy();
      expect(getByText('Downloads')).toBeTruthy();
      expect(getByText('Legal')).toBeTruthy();
    });

    it('should display app info section', () => {
      const { getByText } = renderSettingsScreen();

      expect(getByText('K-Pod')).toBeTruthy();
    });

    it('should display reset settings button', () => {
      const { getByText } = renderSettingsScreen();

      expect(getByText('Reset All Settings')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should open the notifications modal', () => {
      const { getByText } = renderSettingsScreen();

      fireEvent.press(getByText('New episode alerts'));

      expect(mockNavigationFns.navigate).toHaveBeenCalledWith(
        'NotificationSettings',
      );
    });
  });
});
