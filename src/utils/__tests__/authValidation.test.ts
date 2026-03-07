import {
  validateEmail,
  validatePasswordMinLength,
  validatePasswordsMatch,
} from '../authValidation';

describe('validateEmail', () => {
  it('returns error for empty string', () => {
    expect(validateEmail('')).toBe('Email is required.');
  });

  it('returns error for whitespace-only string', () => {
    expect(validateEmail('   ')).toBe('Email is required.');
  });

  it('returns error for string without @', () => {
    expect(validateEmail('notanemail')).toBe(
      'Please enter a valid email address.',
    );
  });

  it('returns error for string without domain extension', () => {
    expect(validateEmail('user@nodomain')).toBe(
      'Please enter a valid email address.',
    );
  });

  it('returns error for string with @ but no local part', () => {
    expect(validateEmail('@example.com')).toBe(
      'Please enter a valid email address.',
    );
  });

  it('returns null for a valid email', () => {
    expect(validateEmail('user@example.com')).toBeNull();
  });

  it('trims whitespace before validating', () => {
    expect(validateEmail('  user@example.com  ')).toBeNull();
  });
});

describe('validatePasswordMinLength', () => {
  it('returns error for a password shorter than 6 characters', () => {
    expect(validatePasswordMinLength('abc')).toBe(
      'Password must be at least 6 characters.',
    );
  });

  it('returns error for a 5-character password', () => {
    expect(validatePasswordMinLength('12345')).toBe(
      'Password must be at least 6 characters.',
    );
  });

  it('returns null for a password of exactly 6 characters', () => {
    expect(validatePasswordMinLength('123456')).toBeNull();
  });

  it('returns null for a password longer than 6 characters', () => {
    expect(validatePasswordMinLength('longpassword')).toBeNull();
  });
});

describe('validatePasswordsMatch', () => {
  it('returns error when passwords do not match', () => {
    expect(validatePasswordsMatch('password1', 'password2')).toBe(
      'Passwords do not match.',
    );
  });

  it('returns error when one password is a substring of the other', () => {
    expect(validatePasswordsMatch('pass', 'password')).toBe(
      'Passwords do not match.',
    );
  });

  it('returns null when both passwords are identical', () => {
    expect(validatePasswordsMatch('mypassword', 'mypassword')).toBeNull();
  });
});
