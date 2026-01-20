import React, { useCallback } from 'react';
import { PodcastPreviewScreenProps } from '../../navigation/types';
import { PodcastPreviewView } from './PodcastPreviewView';

export const PodcastPreviewScreen = ({
  navigation,
  route,
}: PodcastPreviewScreenProps) => {
  const { podcast } = route.params;

  // Navigate back after successful subscription
  const handleSubscribe = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return <PodcastPreviewView podcast={podcast} onSubscribe={handleSubscribe} />;
};

export default PodcastPreviewScreen;
