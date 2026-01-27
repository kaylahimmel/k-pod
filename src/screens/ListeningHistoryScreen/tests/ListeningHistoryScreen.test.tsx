import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ListeningHistoryScreen } from '../ListeningHistoryScreen';
import { StorageService } from '../../../services';
import {
  createMockListeningHistoryItems,
  createMockNavigation,
  createMockRoute,
} from '../../../__mocks__';

// Mock StorageService
jest.mock('../../../services', () => ({
  StorageService: {
    loadHistory: jest.fn().mockResolvedValue([]),
    saveHistory: jest.fn().mockResolvedValue(undefined),
  },
}));

// Spy on Alert
jest.spyOn(Alert, 'alert');

const mockNavigation = createMockNavigation() as unknown as Parameters<
  typeof ListeningHistoryScreen
>[0]['navigation'];

const mockRoute = createMockRoute('ListeningHistory') as Parameters<
  typeof ListeningHistoryScreen
>[0]['route'];

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

  describe('Navigation', () => {
    it('should navigate back when history is cleared', async () => {
      const mockHistory = createMockListeningHistoryItems(3);
      (StorageService.loadHistory as jest.Mock).mockResolvedValue(mockHistory);

      // Mock Alert to automatically confirm the destructive action
      (Alert.alert as jest.Mock).mockImplementation(
        (title, message, buttons) => {
          // Find the "Clear" button and call its onPress
          const clearButton = buttons?.find(
            (b: { text: string }) => b.text === 'Clear',
          );
          if (clearButton?.onPress) {
            clearButton.onPress();
          }
        },
      );

      const { findByText } = renderScreen();

      // Wait for history to load and find Clear All button
      const clearButton = await findByText('Clear All');
      fireEvent.press(clearButton);

      // Verify navigation.goBack was called after clearing
      await waitFor(() => {
        expect(mockNavigation.goBack).toHaveBeenCalled();
      });
    });
  });
});
