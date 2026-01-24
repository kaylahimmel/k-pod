import React, { useCallback } from 'react';
import { FullPlayerScreenProps } from '../../navigation/types';
import { FullPlayerView } from './FullPlayerView';

export const FullPlayerScreen = ({
  navigation,
  route,
}: FullPlayerScreenProps) => {
  const { episode, podcast } = route.params;

  const handleDismiss = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <FullPlayerView
      episode={episode}
      podcast={podcast}
      onDismiss={handleDismiss}
    />
  );
};

export default FullPlayerScreen;
