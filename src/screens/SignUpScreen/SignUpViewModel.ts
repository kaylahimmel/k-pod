import { useState, useCallback } from 'react';
import { AuthService } from '../../services';
import { useAuthStore } from '../../hooks';
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
} from './SignUpPresenter';
import { SignUpViewModelReturn } from './SignUp.types';

/**
 * ViewModel for the Sign Up screen.
 * Manages form state and calls AuthService.signUp().
 * On success, authStore updates which triggers RootNavigator to show the main app.
 */
export const useSignUpViewModel = (): SignUpViewModelReturn => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { setUser } = useAuthStore();

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    setErrorMessage(null);
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    setErrorMessage(null);
  }, []);

  const handleConfirmPasswordChange = useCallback((text: string) => {
    setConfirmPassword(text);
    setErrorMessage(null);
  }, []);

  const handleSignUp = useCallback(async () => {
    // Client-side validation
    const emailError = validateEmail(email);
    if (emailError) {
      setErrorMessage(emailError);
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }
    const matchError = validatePasswordMatch(password, confirmPassword);
    if (matchError) {
      setErrorMessage(matchError);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await AuthService.signUp(email.trim(), password);

    setIsLoading(false);

    if (result.success) {
      setUser(result.data);
    } else {
      setErrorMessage(result.error);
    }
  }, [email, password, confirmPassword, setUser]);

  return {
    email,
    password,
    confirmPassword,
    errorMessage,
    isLoading,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSignUp,
  };
};
