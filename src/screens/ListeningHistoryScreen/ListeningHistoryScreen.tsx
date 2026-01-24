import React, { useCallback } from 'react';
import { ListeningHistoryScreenProps } from '../../navigation/types';
import { ListeningHistoryView } from './ListeningHistoryView';

export const ListeningHistoryScreen = ({
  navigation,
}: ListeningHistoryScreenProps) => {
  const handleClearHistory = useCallback(() => {
    // Navigate back to profile after clearing history
    navigation.goBack();
  }, [navigation]);

  return <ListeningHistoryView onClearHistory={handleClearHistory} />;
};
