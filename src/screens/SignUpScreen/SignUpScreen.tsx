import React, { useCallback } from 'react';
import { SignUpScreenProps } from '../../navigation/types';
import { SignUpView } from './SignUpView';

export const SignUpScreen = ({ navigation }: SignUpScreenProps) => {
  const handleSignInPress = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return <SignUpView onSignInPress={handleSignInPress} />;
};
