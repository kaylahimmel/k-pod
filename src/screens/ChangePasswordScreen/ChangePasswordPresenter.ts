/**
 * Validates that a password field is not empty.
 * Returns an error message string, or null if valid.
 */
import {
  validatePasswordMinLength,
  validatePasswordsMatch,
} from '../../utils/authValidation';

export function validateCurrentPassword(password: string): string | null {
  if (!password) return 'Current password is required.';
  return null;
}

/**
 * Validates a new password meets minimum requirements.
 * Returns an error message string, or null if valid.
 */
export function validateNewPassword(password: string): string | null {
  if (!password) return 'New password is required.';
  return validatePasswordMinLength(password);
}

/**
 * Validates that two passwords match.
 * Returns an error message string, or null if valid.
 */
export function validatePasswordMatch(
  newPassword: string,
  confirmNewPassword: string,
): string | null {
  if (!confirmNewPassword) return 'Please confirm your new password.';
  return validatePasswordsMatch(newPassword, confirmNewPassword);
}
