import React, { useCallback } from 'react';
import { ChangePasswordScreenProps } from '../../navigation/types';
import { ChangePasswordView } from './ChangePasswordView';

export const ChangePasswordScreen = ({
  navigation,
}: ChangePasswordScreenProps) => {
  const handleSuccess = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return <ChangePasswordView onSuccess={handleSuccess} />;
};
