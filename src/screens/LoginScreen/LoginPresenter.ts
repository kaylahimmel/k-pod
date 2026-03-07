export { validateEmail } from '../../utils/authValidation';

/**
 * Validates a password for sign-in (only checks presence, not complexity).
 * Returns an error message string, or null if valid.
 */
export function validateSignInPassword(password: string): string | null {
  if (!password) return 'Password is required.';
  return null;
}
