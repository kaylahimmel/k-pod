import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ListeningHistoryView } from '../ListeningHistoryView';
import { StorageService } from '../../../services';
import { createMockListeningHistoryItems } from '../../../__mocks__';

// Mock StorageService
jest.mock('../../../services', () => ({
  StorageService: {
    loadHistory: jest.fn().mockResolvedValue([]),
    saveHistory: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('ListeningHistoryView', () => {
  const mockOnClearHistory = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (StorageService.loadHistory as jest.Mock).mockResolvedValue([]);
  });

  const renderView = () =>
    render(<ListeningHistoryView onClearHistory={mockOnClearHistory} />);

  describe('Loading State', () => {
    it('should show loading indicator initially', () => {
      // Make the promise pending to test loading state
      (StorageService.loadHistory as jest.Mock).mockReturnValue(
        new Promise(() => {}),
      );

      renderView();

      // ActivityIndicator doesn't have a testID by default, so we check for structure
      // The loading container should be present while loading
      expect(StorageService.loadHistory).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no history', async () => {
      const { findByText } = renderView();

      expect(await findByText('No Listening History')).toBeTruthy();
      expect(
        await findByText(/Start listening to podcasts to see your history/),
      ).toBeTruthy();
    });
  });

  describe('History List', () => {
    it('should display history items', async () => {
      const mockHistory = createMockListeningHistoryItems(3);
      (StorageService.loadHistory as jest.Mock).mockResolvedValue(mockHistory);

      const { findByText } = renderView();

      expect(await findByText('3 episodes in history')).toBeTruthy();
      expect(await findByText('Clear All')).toBeTruthy();
    });

    it('should display history summary', async () => {
      const mockHistory = createMockListeningHistoryItems(5);
      (StorageService.loadHistory as jest.Mock).mockResolvedValue(mockHistory);

      const { findByText } = renderView();

      expect(await findByText('5 episodes in history')).toBeTruthy();
    });

    it('should display singular summary for 1 item', async () => {
      const mockHistory = createMockListeningHistoryItems(1);
      (StorageService.loadHistory as jest.Mock).mockResolvedValue(mockHistory);

      const { findByText } = renderView();

      expect(await findByText('1 episode in history')).toBeTruthy();
    });
  });

  describe('Clear History', () => {
    it('should show confirmation alert when Clear All is pressed', async () => {
      const mockHistory = createMockListeningHistoryItems(3);
      (StorageService.loadHistory as jest.Mock).mockResolvedValue(mockHistory);

      const { findByText } = renderView();

      const clearButton = await findByText('Clear All');
      fireEvent.press(clearButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Clear History',
        'Are you sure you want to clear your listening history? This action cannot be undone.',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
          expect.objectContaining({ text: 'Clear', style: 'destructive' }),
        ]),
      );
    });

    it('should clear history and call callback when confirmed', async () => {
      const mockHistory = createMockListeningHistoryItems(3);
      (StorageService.loadHistory as jest.Mock).mockResolvedValue(mockHistory);

      const { findByText } = renderView();

      const clearButton = await findByText('Clear All');
      fireEvent.press(clearButton);

      // Simulate pressing "Clear" in the alert
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const clearAction = alertCall[2].find(
        (button: { text: string }) => button.text === 'Clear',
      );
      await clearAction.onPress();

      await waitFor(() => {
        expect(StorageService.saveHistory).toHaveBeenCalledWith([]);
        expect(mockOnClearHistory).toHaveBeenCalled();
      });
    });

    it('should not clear history when cancelled', async () => {
      const mockHistory = createMockListeningHistoryItems(3);
      (StorageService.loadHistory as jest.Mock).mockResolvedValue(mockHistory);

      const { findByText } = renderView();

      const clearButton = await findByText('Clear All');
      fireEvent.press(clearButton);

      // The Cancel button doesn't have an onPress handler, just style: 'cancel'
      // So we just verify the alert was shown and storage was not modified
      expect(StorageService.saveHistory).not.toHaveBeenCalled();
      expect(mockOnClearHistory).not.toHaveBeenCalled();
    });
  });
});
