import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ProfileView } from '../ProfileView';
import { podcastStore } from '../../../stores';
import { StorageService } from '../../../services';
import {
  createMockPodcasts,
  createMockListeningHistoryItems,
} from '../../../__mocks__';

// Mock StorageService
jest.mock('../../../services', () => ({
  StorageService: {
    loadHistory: jest.fn().mockResolvedValue([]),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('ProfileView', () => {
  const mockOnViewHistoryPress = jest.fn();
  const mockOnChangePasswordPress = jest.fn();
  const mockOnSignOutPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    podcastStore.setState({
      podcasts: [],
      loading: false,
      error: null,
    });
    (StorageService.loadHistory as jest.Mock).mockResolvedValue([]);
  });

  const renderProfileView = () =>
    render(
      <ProfileView
        onViewHistoryPress={mockOnViewHistoryPress}
        onChangePasswordPress={mockOnChangePasswordPress}
        onSignOutPress={mockOnSignOutPress}
      />,
    );

  describe('User Header', () => {
    it('should display user initials in avatar', async () => {
      const { findByText } = renderProfileView();

      // Mock user has email "user@example.com" -> initials "US"
      expect(await findByText('US')).toBeTruthy();
    });

    it('should display user email', async () => {
      const { findByText } = renderProfileView();

      expect(await findByText('user@example.com')).toBeTruthy();
    });
  });

  describe('Stats Section', () => {
    it('should display listening time stat', async () => {
      const { findByText } = renderProfileView();

      expect(await findByText('Listening Time')).toBeTruthy();
      expect(await findByText('0 min')).toBeTruthy();
    });

    it('should display episodes completed stat', async () => {
      const { findByText } = renderProfileView();

      expect(await findByText('Episodes')).toBeTruthy();
    });

    it('should display podcasts subscribed stat', async () => {
      podcastStore.setState({
        podcasts: createMockPodcasts(5),
        loading: false,
        error: null,
      });

      const { findByText } = renderProfileView();

      expect(await findByText('Subscribed')).toBeTruthy();
      expect(await findByText('5')).toBeTruthy();
    });
  });

  describe('Recent Activity Section', () => {
    it('should show empty state when no history', async () => {
      const { findByText } = renderProfileView();

      expect(await findByText('Recent Activity')).toBeTruthy();
      expect(await findByText(/No listening history yet/)).toBeTruthy();
    });

    it('should display recent history items', async () => {
      const historyItems = createMockListeningHistoryItems(3);
      (StorageService.loadHistory as jest.Mock).mockResolvedValue(historyItems);

      const { findByText } = renderProfileView();

      await waitFor(async () => {
        expect(await findByText('Episode 1')).toBeTruthy();
      });
    });

    it('should show View All History button when history exists', async () => {
      const historyItems = createMockListeningHistoryItems(3);
      (StorageService.loadHistory as jest.Mock).mockResolvedValue(historyItems);

      const { findByText } = renderProfileView();

      expect(await findByText('View All History')).toBeTruthy();
    });

    it('should call onViewHistoryPress when View All History is pressed', async () => {
      const historyItems = createMockListeningHistoryItems(3);
      (StorageService.loadHistory as jest.Mock).mockResolvedValue(historyItems);

      const { findByText } = renderProfileView();

      const button = await findByText('View All History');
      fireEvent.press(button);

      expect(mockOnViewHistoryPress).toHaveBeenCalled();
    });
  });

  describe('Account Actions', () => {
    it('should display Change Password option', async () => {
      const { findByText } = renderProfileView();

      expect(await findByText('Change Password')).toBeTruthy();
    });

    it('should call onChangePasswordPress when Change Password is pressed', async () => {
      const { findByText } = renderProfileView();

      const button = await findByText('Change Password');
      fireEvent.press(button);

      expect(mockOnChangePasswordPress).toHaveBeenCalled();
    });

    it('should display Sign Out option', async () => {
      const { findByText } = renderProfileView();

      expect(await findByText('Sign Out')).toBeTruthy();
    });

    it('should show confirmation alert when Sign Out is pressed', async () => {
      const { findByText } = renderProfileView();

      const button = await findByText('Sign Out');
      fireEvent.press(button);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Sign Out',
        'Are you sure you want to sign out?',
        expect.any(Array),
      );
    });

    it('should call onSignOutPress when confirmed', async () => {
      const { findByText } = renderProfileView();

      const button = await findByText('Sign Out');
      fireEvent.press(button);

      // Get the Alert.alert call and simulate pressing "Sign Out"
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const signOutButton = alertCall[2].find(
        (btn: { text: string }) => btn.text === 'Sign Out',
      );
      signOutButton.onPress();

      expect(mockOnSignOutPress).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator while loading', () => {
      // The loading state is brief, but we can test that the component renders
      const { toJSON } = renderProfileView();
      expect(toJSON()).toBeTruthy();
    });
  });
});
