import React, { useCallback } from 'react';
import { LoginScreenProps } from '../../navigation/types';
import { LoginView } from './LoginView';

export const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const handleSignUpPress = useCallback(() => {
    navigation.navigate('SignUp');
  }, [navigation]);

  const handleForgotPasswordPress = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  return (
    <LoginView
      onSignUpPress={handleSignUpPress}
      onForgotPasswordPress={handleForgotPasswordPress}
    />
  );
};
