import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { StorageService } from '../../services';
import { ListeningHistory } from '../../models';
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
  const [rawHistory, setRawHistory] = useState<ListeningHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history on mount
  useEffect(() => {
    const loadHistoryData = async () => {
      setIsLoading(true);
      try {
        const loadedHistory = await StorageService.loadHistory();
        setRawHistory(loadedHistory);
      } catch (error) {
        console.error('Error loading listening history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistoryData();
  }, []);

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
              await StorageService.saveHistory([]);
              setRawHistory([]);
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
  }, [onClearHistory]);

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
