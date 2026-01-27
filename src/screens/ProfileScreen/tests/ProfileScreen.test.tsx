import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ProfileScreen } from '../ProfileScreen';
import { podcastStore } from '../../../stores';
import { StorageService } from '../../../services';
import {
  createMockPodcasts,
  createMockNavigation,
  createMockRoute,
  createMockListeningHistoryItems,
} from '../../../__mocks__';

// Spy on Alert
jest.spyOn(Alert, 'alert');

// Mock StorageService
jest.mock('../../../services', () => ({
  StorageService: {
    loadHistory: jest.fn().mockResolvedValue([]),
  },
}));

const mockNavigation = createMockNavigation() as unknown as Parameters<
  typeof ProfileScreen
>[0]['navigation'];

const mockRoute = createMockRoute('Profile') as Parameters<
  typeof ProfileScreen
>[0]['route'];

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    podcastStore.setState({
      podcasts: [],
      loading: false,
      error: null,
    });
    (StorageService.loadHistory as jest.Mock).mockResolvedValue([]);
  });

  const renderProfileScreen = () =>
    render(<ProfileScreen navigation={mockNavigation} route={mockRoute} />);

  describe('Rendering', () => {
    it('should render ProfileView', async () => {
      const { findByText } = renderProfileScreen();

      // Wait for loading to complete and check for user email (mock user)
      expect(await findByText('user@example.com')).toBeTruthy();
    });

    it('should display stats section', async () => {
      podcastStore.setState({
        podcasts: createMockPodcasts(3),
        loading: false,
        error: null,
      });

      const { findByText } = renderProfileScreen();

      expect(await findByText('Listening Time')).toBeTruthy();
      expect(await findByText('Episodes')).toBeTruthy();
      expect(await findByText('Subscribed')).toBeTruthy();
    });

    it('should display account actions', async () => {
      const { findByText } = renderProfileScreen();

      expect(await findByText('Change Password')).toBeTruthy();
      expect(await findByText('Sign Out')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to ListeningHistory when View All History is pressed', async () => {
      // Mock history data so the button appears
      const mockHistory = createMockListeningHistoryItems(3);
      (StorageService.loadHistory as jest.Mock).mockResolvedValue(mockHistory);

      const { findByText } = renderProfileScreen();

      const viewAllButton = await findByText('View All History');
      fireEvent.press(viewAllButton);

      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith(
          'ListeningHistory',
        );
      });
    });

    it('should navigate to ChangePassword when Change Password is pressed', async () => {
      const { findByText } = renderProfileScreen();

      const changePasswordButton = await findByText('Change Password');
      fireEvent.press(changePasswordButton);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('ChangePassword');
    });

    it('should show confirmation alert when Sign Out is pressed', async () => {
      const { findByText } = renderProfileScreen();

      const signOutButton = await findByText('Sign Out');
      fireEvent.press(signOutButton);

      // ViewModel shows confirmation dialog first
      expect(Alert.alert).toHaveBeenCalledWith(
        'Sign Out',
        'Are you sure you want to sign out?',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel' }),
          expect.objectContaining({ text: 'Sign Out', style: 'destructive' }),
        ]),
      );
    });

    it('should show signed out message when sign out is confirmed', async () => {
      // Mock Alert.alert to automatically confirm the sign out
      (Alert.alert as jest.Mock).mockImplementation(
        (title, message, buttons) => {
          if (title === 'Sign Out' && buttons) {
            const confirmButton = buttons.find(
              (b: { text: string }) => b.text === 'Sign Out',
            );
            if (confirmButton?.onPress) {
              confirmButton.onPress();
            }
          }
        },
      );

      const { findByText } = renderProfileScreen();

      const signOutButton = await findByText('Sign Out');
      fireEvent.press(signOutButton);

      // After confirming, the success message should be shown
      expect(Alert.alert).toHaveBeenCalledWith(
        'Signed Out',
        'You have been signed out successfully.',
      );
    });
  });

  describe('Empty States', () => {
    it('should show empty history message when no history', async () => {
      const { findByText } = renderProfileScreen();

      expect(await findByText(/No listening history yet/)).toBeTruthy();
    });
  });
});
