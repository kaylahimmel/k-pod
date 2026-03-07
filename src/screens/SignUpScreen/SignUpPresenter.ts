import {
  validatePasswordMinLength,
  validatePasswordsMatch,
} from '../../utils/authValidation';

export { validateEmail } from '../../utils/authValidation';

/**
 * Validates a password for sign-up (minimum length enforced).
 * Returns an error message string, or null if valid.
 */
export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required.';
  return validatePasswordMinLength(password);
}

/**
 * Validates that two passwords match.
 * Returns an error message string, or null if valid.
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string,
): string | null {
  if (!confirmPassword) return 'Please confirm your password.';
  return validatePasswordsMatch(password, confirmPassword);
}
