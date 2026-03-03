import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { User, ServiceResult } from '../models';

/**
 * Maps a Firebase user to our app's User model.
 * Preferences default to light theme and notifications enabled.
 */
function mapFirebaseUser(firebaseUser: FirebaseUser): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    preferences: {
      theme: 'light',
      notifications: true,
    },
  };
}

/**
 * Converts Firebase auth error codes to user-friendly messages.
 */
function formatFirebaseError(error: unknown): string {
  if (error instanceof Error && 'code' in error) {
    const code = (error as { code: string }).code;
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/requires-recent-login':
        return 'Please sign in again before changing your password.';
      case 'auth/operation-not-allowed':
        return 'Email/password sign-in is not enabled. Contact support.';
      default:
        console.warn('[AuthService] Unhandled Firebase error code:', code);
        return 'Something went wrong. Please try again.';
    }
  }
  return 'Something went wrong. Please try again.';
}

async function signUp(
  email: string,
  password: string,
): Promise<ServiceResult<User>> {
  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { success: true, data: mapFirebaseUser(credential.user) };
  } catch (error) {
    return { success: false, error: formatFirebaseError(error) };
  }
}

async function signIn(
  email: string,
  password: string,
): Promise<ServiceResult<User>> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, data: mapFirebaseUser(credential.user) };
  } catch (error) {
    return { success: false, error: formatFirebaseError(error) };
  }
}

async function signOut(): Promise<ServiceResult<void>> {
  try {
    await firebaseSignOut(auth);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: formatFirebaseError(error) };
  }
}

/**
 * Changes the user's password.
 * Re-authenticates with the current password first (required by Firebase).
 */
async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<ServiceResult<void>> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      return { success: false, error: 'No authenticated user found.' };
    }

    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPassword,
    );
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: formatFirebaseError(error) };
  }
}

async function sendPasswordResetEmail(
  email: string,
): Promise<ServiceResult<void>> {
  try {
    await firebaseSendPasswordResetEmail(auth, email);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: formatFirebaseError(error) };
  }
}

function getCurrentUser(): User | null {
  const firebaseUser = auth.currentUser;
  return firebaseUser ? mapFirebaseUser(firebaseUser) : null;
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function — call it on cleanup to prevent memory leaks.
 */
function onAuthStateChanged(callback: (user: User | null) => void): () => void {
  return firebaseOnAuthStateChanged(auth, (firebaseUser) => {
    callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
  });
}

export const AuthService = {
  signUp,
  signIn,
  signOut,
  changePassword,
  sendPasswordResetEmail,
  getCurrentUser,
  onAuthStateChanged,
};
