import React, { useCallback } from 'react';
import { ProfileScreenProps } from '../../navigation/types';
import { ProfileView } from './ProfileView';

export const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const handleViewHistoryPress = useCallback(() => {
    navigation.navigate('ListeningHistory');
  }, [navigation]);

  const handleChangePasswordPress = useCallback(() => {
    navigation.navigate('ChangePassword');
  }, [navigation]);

  return (
    <ProfileView
      onViewHistoryPress={handleViewHistoryPress}
      onChangePasswordPress={handleChangePasswordPress}
    />
  );
};
