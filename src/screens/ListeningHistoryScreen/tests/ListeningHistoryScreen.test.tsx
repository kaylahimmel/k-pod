import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { ListeningHistoryScreen } from '../ListeningHistoryScreen';
import { StorageService } from '../../../services';
import { createMockListeningHistoryItems } from '../../../__mocks__';

// Mock StorageService
jest.mock('../../../services', () => ({
  StorageService: {
    loadHistory: jest.fn().mockResolvedValue([]),
    saveHistory: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
} as unknown as Parameters<typeof ListeningHistoryScreen>[0]['navigation'];

const mockRoute = {
  key: 'listening-history-screen',
  name: 'ListeningHistory' as const,
  params: undefined,
} as Parameters<typeof ListeningHistoryScreen>[0]['route'];

describe('ListeningHistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (StorageService.loadHistory as jest.Mock).mockResolvedValue([]);
  });

  const renderScreen = () =>
    render(
      <ListeningHistoryScreen navigation={mockNavigation} route={mockRoute} />,
    );

  describe('Rendering', () => {
    it('should render ListeningHistoryView', async () => {
      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('No Listening History')).toBeTruthy();
      });
    });

    it('should display history items when history exists', async () => {
      const mockHistory = createMockListeningHistoryItems(3);
      (StorageService.loadHistory as jest.Mock).mockResolvedValue(mockHistory);

      const { findByText } = renderScreen();

      expect(await findByText('3 episodes in history')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should show empty state message when no history', async () => {
      const { findByText } = renderScreen();

      expect(await findByText('No Listening History')).toBeTruthy();
      expect(
        await findByText(/Start listening to podcasts to see your history/),
      ).toBeTruthy();
    });
  });
});
