import { useState, useCallback } from 'react';
import { AuthService } from '../../services';
import { useAuthStore } from '../../hooks';
import { validateEmail, validateSignInPassword } from './LoginPresenter';
import { LoginViewModelReturn } from './Login.types';

/**
 * ViewModel for the Login screen.
 * Manages form state and calls AuthService.signIn().
 * On success, authStore updates which triggers RootNavigator to show the main app.
 */
export const useLoginViewModel = (): LoginViewModelReturn => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleSignIn = useCallback(async () => {
    // Client-side validation
    const emailError = validateEmail(email);
    if (emailError) {
      setErrorMessage(emailError);
      return;
    }
    const passwordError = validateSignInPassword(password);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await AuthService.signIn(email.trim(), password);

    setIsLoading(false);

    if (result.success) {
      setUser(result.data);
    } else {
      setErrorMessage(result.error);
    }
  }, [email, password, setUser]);

  return {
    email,
    password,
    errorMessage,
    isLoading,
    handleEmailChange,
    handlePasswordChange,
    handleSignIn,
  };
};
