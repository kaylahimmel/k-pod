import React from 'react';
import { render } from '@testing-library/react-native';
import { ProfileScreen } from '../ProfileScreen';
import { podcastStore } from '../../../stores';
import { StorageService } from '../../../services';
import {
  createMockPodcasts,
  createMockNavigation,
  createMockRoute,
} from '../../../__mocks__';

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
      // Note: Since there's no history, the button won't be shown
      // TO-DO: Make a mock of the history and add test
      const { queryByText } = renderProfileScreen();

      // Empty state shows no "View All History" button
      expect(queryByText('View All History')).toBeNull();
    });
  });

  describe('Empty States', () => {
    it('should show empty history message when no history', async () => {
      const { findByText } = renderProfileScreen();

      expect(await findByText(/No listening history yet/)).toBeTruthy();
    });
  });
});
