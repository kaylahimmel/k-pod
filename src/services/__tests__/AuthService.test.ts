import { AuthService } from '../AuthService';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../../config/firebase';

// Mock the firebase config module before AuthService imports it
jest.mock('../../config/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

// Mock all firebase/auth functions used by AuthService
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updatePassword: jest.fn(),
  reauthenticateWithCredential: jest.fn(),
  EmailAuthProvider: {
    credential: jest.fn(),
  },
  sendPasswordResetEmail: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

const mockFirebaseUser = {
  uid: 'firebase-uid-123',
  email: 'test@example.com',
};

const expectedMappedUser = {
  id: 'firebase-uid-123',
  email: 'test@example.com',
  preferences: { theme: 'light', notifications: true },
};

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should return success with mapped user on successful sign up', async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockFirebaseUser,
      });

      const result = await AuthService.signUp(
        'test@example.com',
        'password123',
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(expectedMappedUser);
      }
    });

    it('should return failure with user-friendly message on email-already-in-use', async () => {
      const error = Object.assign(new Error('Firebase error'), {
        code: 'auth/email-already-in-use',
      });
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

      const result = await AuthService.signUp('taken@example.com', 'password');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('An account with this email already exists.');
      }
    });

    it('should return failure with message for weak password', async () => {
      const error = Object.assign(new Error('Firebase error'), {
        code: 'auth/weak-password',
      });
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

      const result = await AuthService.signUp('test@example.com', '123');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Password must be at least 6 characters.');
      }
    });
  });

  describe('signIn', () => {
    it('should return success with mapped user on successful sign in', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockFirebaseUser,
      });

      const result = await AuthService.signIn(
        'test@example.com',
        'password123',
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(expectedMappedUser);
      }
    });

    it('should return failure with message for invalid credentials', async () => {
      const error = Object.assign(new Error('Firebase error'), {
        code: 'auth/invalid-credential',
      });
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

      const result = await AuthService.signIn(
        'test@example.com',
        'wrongpassword',
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Incorrect email or password.');
      }
    });

    it('should return failure for network errors', async () => {
      const error = Object.assign(new Error('Firebase error'), {
        code: 'auth/network-request-failed',
      });
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

      const result = await AuthService.signIn('test@example.com', 'password');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(
          'Network error. Please check your connection.',
        );
      }
    });
  });

  describe('signOut', () => {
    it('should return success on successful sign out', async () => {
      (signOut as jest.Mock).mockResolvedValue(undefined);

      const result = await AuthService.signOut();

      expect(result.success).toBe(true);
    });

    it('should return failure if sign out throws', async () => {
      (signOut as jest.Mock).mockRejectedValue(new Error('network error'));

      const result = await AuthService.signOut();

      expect(result.success).toBe(false);
    });
  });

  describe('changePassword', () => {
    it('should reauthenticate and update password on success', async () => {
      const mockCredential = { providerId: 'password' };
      (EmailAuthProvider.credential as jest.Mock).mockReturnValue(
        mockCredential,
      );
      (reauthenticateWithCredential as jest.Mock).mockResolvedValue(undefined);
      (updatePassword as jest.Mock).mockResolvedValue(undefined);

      // Set up a currentUser on auth
      Object.defineProperty(auth, 'currentUser', {
        value: { ...mockFirebaseUser },
        writable: true,
        configurable: true,
      });

      const result = await AuthService.changePassword('oldPass', 'newPass123');

      expect(reauthenticateWithCredential).toHaveBeenCalled();
      expect(updatePassword).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should return failure when no user is authenticated', async () => {
      Object.defineProperty(auth, 'currentUser', {
        value: null,
        writable: true,
        configurable: true,
      });

      const result = await AuthService.changePassword('oldPass', 'newPass');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('No authenticated user found.');
      }
    });

    it('should return failure with requires-recent-login message', async () => {
      Object.defineProperty(auth, 'currentUser', {
        value: { ...mockFirebaseUser },
        writable: true,
        configurable: true,
      });

      const error = Object.assign(new Error('Firebase error'), {
        code: 'auth/requires-recent-login',
      });
      (reauthenticateWithCredential as jest.Mock).mockRejectedValue(error);

      const result = await AuthService.changePassword(
        'wrongOldPass',
        'newPass',
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(
          'Please sign in again before changing your password.',
        );
      }
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should return success when email is sent', async () => {
      (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

      const result =
        await AuthService.sendPasswordResetEmail('test@example.com');

      expect(result.success).toBe(true);
    });

    it('should return failure when user is not found', async () => {
      const error = Object.assign(new Error('Firebase error'), {
        code: 'auth/user-not-found',
      });
      (sendPasswordResetEmail as jest.Mock).mockRejectedValue(error);

      const result = await AuthService.sendPasswordResetEmail(
        'unknown@example.com',
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Incorrect email or password.');
      }
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no user is signed in', () => {
      Object.defineProperty(auth, 'currentUser', {
        value: null,
        writable: true,
        configurable: true,
      });

      expect(AuthService.getCurrentUser()).toBeNull();
    });

    it('should return mapped user when a user is signed in', () => {
      Object.defineProperty(auth, 'currentUser', {
        value: mockFirebaseUser,
        writable: true,
        configurable: true,
      });

      const user = AuthService.getCurrentUser();

      expect(user).toEqual(expectedMappedUser);
    });
  });

  describe('onAuthStateChanged', () => {
    it('should subscribe to auth state changes and return an unsubscribe function', () => {
      const mockUnsubscribe = jest.fn();
      (onAuthStateChanged as jest.Mock).mockReturnValue(mockUnsubscribe);

      const callback = jest.fn();
      const unsubscribe = AuthService.onAuthStateChanged(callback);

      expect(onAuthStateChanged).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });
  });
});
