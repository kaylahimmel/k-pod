import { useState, useCallback } from 'react';
import { AuthService } from '../../services';
import { validateEmail } from '../../utils/authValidation';
import { ForgotPasswordViewModelReturn } from './ForgotPassword.types';

/**
 * ViewModel for the Forgot Password screen.
 * Sends a password reset email via AuthService.
 * On success, shows a confirmation UI so the user knows to check their email.
 */
export const useForgotPasswordViewModel = (): ForgotPasswordViewModelReturn => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    setErrorMessage(null);
  }, []);

  const handleSendResetEmail = useCallback(async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setErrorMessage(emailError);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await AuthService.sendPasswordResetEmail(email.trim());

    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
    } else {
      setErrorMessage(result.error);
    }
  }, [email]);

  return {
    email,
    errorMessage,
    isLoading,
    isSuccess,
    handleEmailChange,
    handleSendResetEmail,
  };
};
