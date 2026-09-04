import React, { act } from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ActivityIndicator, Alert } from 'react-native';
import { ListeningHistoryView } from '../ListeningHistoryView';
import { createMockListeningHistoryItems } from '../../../__mocks__';
import { historyStore } from '../../../stores';

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('ListeningHistoryView', () => {
  const mockOnClearHistory = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // History is owned by the persisted store; seed it directly rather than
    // stubbing a storage call the store no longer makes.
    historyStore.setState({ history: [], hasHydrated: true });
  });

  const renderView = async () => {
    const result = render(
      <ListeningHistoryView onClearHistory={mockOnClearHistory} />,
    );
    // Flush any pending state updates from render
    await act(async () => {});
    return result;
  };

  describe('Loading State', () => {
    it('should show loading indicator until the history store hydrates', async () => {
      historyStore.setState({ history: [], hasHydrated: false });

      const { UNSAFE_queryByType } = await renderView();

      expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no history', async () => {
      const { getByText } = await renderView();

      expect(getByText('No Listening History')).toBeTruthy();
      expect(
        getByText(/Start listening to podcasts to see your history/),
      ).toBeTruthy();
    });
  });

  describe('History List', () => {
    it('should display history items', async () => {
      const mockHistory = createMockListeningHistoryItems(3);
      historyStore.setState({ history: mockHistory, hasHydrated: true });

      const { getByText } = await renderView();

      expect(getByText('3 episodes in history')).toBeTruthy();
      expect(getByText('Clear All')).toBeTruthy();
    });

    it('should display history summary', async () => {
      const mockHistory = createMockListeningHistoryItems(5);
      historyStore.setState({ history: mockHistory, hasHydrated: true });

      const { getByText } = await renderView();

      expect(getByText('5 episodes in history')).toBeTruthy();
    });

    it('should display singular summary for 1 item', async () => {
      const mockHistory = createMockListeningHistoryItems(1);
      historyStore.setState({ history: mockHistory, hasHydrated: true });

      const { getByText } = await renderView();

      expect(getByText('1 episode in history')).toBeTruthy();
    });
  });

  describe('Clear History', () => {
    it('should show confirmation alert when Clear All is pressed', async () => {
      const mockHistory = createMockListeningHistoryItems(3);
      historyStore.setState({ history: mockHistory, hasHydrated: true });

      const { getByText } = await renderView();

      fireEvent.press(getByText('Clear All'));

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
      historyStore.setState({ history: mockHistory, hasHydrated: true });

      const { getByText } = await renderView();

      fireEvent.press(getByText('Clear All'));

      // Simulate pressing "Clear" in the alert
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const clearAction = alertCall[2].find(
        (button: { text: string }) => button.text === 'Clear',
      );
      await act(async () => {
        await clearAction.onPress();
      });

      expect(historyStore.getState().history).toEqual([]);
      expect(mockOnClearHistory).toHaveBeenCalled();
    });

    it('should not clear history when cancelled', async () => {
      const mockHistory = createMockListeningHistoryItems(3);
      historyStore.setState({ history: mockHistory, hasHydrated: true });

      const { getByText } = await renderView();

      fireEvent.press(getByText('Clear All'));

      // The Cancel button doesn't have an onPress handler, just style: 'cancel'
      // So we just verify the alert was shown and history was not modified
      expect(historyStore.getState().history).toHaveLength(3);
      expect(mockOnClearHistory).not.toHaveBeenCalled();
    });
  });
});
