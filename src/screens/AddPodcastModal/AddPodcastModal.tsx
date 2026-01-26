import React, { useCallback } from 'react';
import { AddPodcastModalScreenProps } from '../../navigation/types';
import { AddPodcastView } from './AddPodcastView';

export const AddPodcastModal = ({ navigation }: AddPodcastModalScreenProps) => {
  const handleDismiss = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleGoToDiscover = useCallback(() => {
    navigation.navigate('Main', {
      screen: 'DiscoverTab',
      params: { screen: 'Discover' },
    });
  }, [navigation]);

  return (
    <AddPodcastView
      onDismiss={handleDismiss}
      onGoToDiscover={handleGoToDiscover}
    />
  );
};

export default AddPodcastModal;
