import { useState, useCallback } from 'react';
import { AuthService } from '../../services';
import {
  validateCurrentPassword,
  validateNewPassword,
  validatePasswordMatch,
} from './ChangePasswordPresenter';
import { ChangePasswordViewModelReturn } from './ChangePassword.types';

/**
 * ViewModel for the Change Password screen.
 * Re-authenticates the user before updating the password (required by Firebase).
 * On success, sets isSuccess so the View can show a confirmation then navigate back.
 */
export const useChangePasswordViewModel = (
  onSuccess: () => void,
): ChangePasswordViewModelReturn => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCurrentPasswordChange = useCallback((text: string) => {
    setCurrentPassword(text);
    setErrorMessage(null);
  }, []);

  const handleNewPasswordChange = useCallback((text: string) => {
    setNewPassword(text);
    setErrorMessage(null);
  }, []);

  const handleConfirmNewPasswordChange = useCallback((text: string) => {
    setConfirmNewPassword(text);
    setErrorMessage(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    // Client-side validation
    const currentPasswordError = validateCurrentPassword(currentPassword);
    if (currentPasswordError) {
      setErrorMessage(currentPasswordError);
      return;
    }
    const newPasswordError = validateNewPassword(newPassword);
    if (newPasswordError) {
      setErrorMessage(newPasswordError);
      return;
    }
    const matchError = validatePasswordMatch(newPassword, confirmNewPassword);
    if (matchError) {
      setErrorMessage(matchError);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await AuthService.changePassword(
      currentPassword,
      newPassword,
    );

    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
      // Give the user a moment to see the success state before navigating back
      setTimeout(() => onSuccess(), 1500);
    } else {
      setErrorMessage(result.error);
    }
  }, [currentPassword, newPassword, confirmNewPassword, onSuccess]);

  return {
    currentPassword,
    newPassword,
    confirmNewPassword,
    errorMessage,
    isLoading,
    isSuccess,
    handleCurrentPasswordChange,
    handleNewPasswordChange,
    handleConfirmNewPasswordChange,
    handleSubmit,
  };
};
