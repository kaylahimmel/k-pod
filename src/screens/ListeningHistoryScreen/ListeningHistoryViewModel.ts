import { useCallback, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useHistoryStore } from '../../hooks';
import {
  formatAllHistory,
  getHistorySummary,
} from './ListeningHistoryPresenter';
import { ListeningHistoryViewModelReturn } from './ListeningHistory.types';

/**
 * ViewModel hook for the Listening History screen
 * Manages full history list and clear history functionality
 */
export const useListeningHistoryViewModel = (
  onClearHistory: () => void,
): ListeningHistoryViewModelReturn => {
  const {
    history: rawHistory,
    isLoading,
    loadHistory,
    clearHistory: clearHistoryStore,
  } = useHistoryStore();

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Formatted history from presenter
  const history = useMemo(() => formatAllHistory(rawHistory), [rawHistory]);

  // Derived state
  const isEmpty = rawHistory.length === 0;
  const historySummary = useMemo(
    () => getHistorySummary(rawHistory.length),
    [rawHistory.length],
  );

  // Clear history with confirmation
  const handleClearHistory = useCallback(() => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear your listening history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearHistoryStore();
              onClearHistory();
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert(
                'Error',
                'Failed to clear history. Please try again.',
              );
            }
          },
        },
      ],
    );
  }, [clearHistoryStore, onClearHistory]);

  return {
    history,
    isLoading,
    isEmpty,
    historySummary,
    handleClearHistory,
  };
};

export type ListeningHistoryViewModel = ReturnType<
  typeof useListeningHistoryViewModel
>;
