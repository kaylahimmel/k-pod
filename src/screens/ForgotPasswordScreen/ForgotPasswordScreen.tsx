import React, { useCallback } from 'react';
import { ForgotPasswordScreenProps } from '../../navigation/types';
import { ForgotPasswordView } from './ForgotPasswordView';

export const ForgotPasswordScreen = ({
  navigation,
}: ForgotPasswordScreenProps) => {
  const handleBackToSignInPress = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return <ForgotPasswordView onBackToSignInPress={handleBackToSignInPress} />;
};
