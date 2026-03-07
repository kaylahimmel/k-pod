import { authStore } from '../authStore';
import { User } from '../../models';

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  preferences: { theme: 'light', notifications: true },
};

describe('authStore', () => {
  beforeEach(() => {
    authStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
    });
  });

  describe('initial state', () => {
    it('should start with no user, not authenticated, and loading', () => {
      const state = authStore.getState();

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('setUser', () => {
    it('should set user and mark as authenticated when user is provided', () => {
      authStore.getState().setUser(mockUser);

      const state = authStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should clear user and mark as not authenticated when null is provided', () => {
      authStore.getState().setUser(mockUser);
      authStore.getState().setUser(null);

      const state = authStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('should update isLoading state', () => {
      authStore.getState().setLoading(false);
      expect(authStore.getState().isLoading).toBe(false);

      authStore.getState().setLoading(true);
      expect(authStore.getState().isLoading).toBe(true);
    });
  });

  describe('setError', () => {
    it('should set an error message', () => {
      authStore.getState().setError('Something went wrong.');
      expect(authStore.getState().error).toBe('Something went wrong.');
    });

    it('should clear the error when null is passed', () => {
      authStore.getState().setError('Error');
      authStore.getState().setError(null);
      expect(authStore.getState().error).toBeNull();
    });
  });

  describe('clearAuth', () => {
    it('should reset user, authentication, and error state', () => {
      authStore.getState().setUser(mockUser);
      authStore.getState().setError('Some error');

      authStore.getState().clearAuth();

      const state = authStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
