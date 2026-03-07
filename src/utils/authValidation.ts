/**
 * Validates an email address format.
 * Returns an error message string, or null if valid.
 */
export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim()))
    return 'Please enter a valid email address.';
  return null;
}

/**
 * Validates that a password meets the minimum length requirement (6 characters).
 * Returns an error message string, or null if valid.
 */
export function validatePasswordMinLength(password: string): string | null {
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

/**
 * Validates that two password strings match.
 * Returns an error message string, or null if they match.
 */
export function validatePasswordsMatch(
  password: string,
  confirmPassword: string,
): string | null {
  if (password !== confirmPassword) return 'Passwords do not match.';
  return null;
}
