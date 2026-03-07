import { renderHook, act } from '@testing-library/react-native';
import { useLoginViewModel } from '../LoginViewModel';

import { useAuthStore } from '../../../hooks';
import { AuthService } from '../../../services';

jest.mock('../../../hooks', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../../services', () => ({
  AuthService: {
    signIn: jest.fn(),
  },
}));

const mockSetUser = jest.fn();

describe('useLoginViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as jest.Mock).mockReturnValue({ setUser: mockSetUser });
  });

  it('should initialise with empty fields and no error', () => {
    const { result } = renderHook(() => useLoginViewModel());

    expect(result.current.email).toBe('');
    expect(result.current.password).toBe('');
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should update email and clear error on handleEmailChange', () => {
    const { result } = renderHook(() => useLoginViewModel());

    act(() => result.current.handleEmailChange('test@example.com'));

    expect(result.current.email).toBe('test@example.com');
    expect(result.current.errorMessage).toBeNull();
  });

  it('should update password and clear error on handlePasswordChange', () => {
    const { result } = renderHook(() => useLoginViewModel());

    act(() => result.current.handlePasswordChange('secret'));

    expect(result.current.password).toBe('secret');
    expect(result.current.errorMessage).toBeNull();
  });

  describe('handleSignIn', () => {
    it('should set errorMessage when email is invalid', async () => {
      const { result } = renderHook(() => useLoginViewModel());

      act(() => result.current.handleEmailChange('not-an-email'));
      await act(async () => {
        await result.current.handleSignIn();
      });

      expect(result.current.errorMessage).toBeTruthy();
      expect(AuthService.signIn).not.toHaveBeenCalled();
    });

    it('should set errorMessage when password is empty', async () => {
      const { result } = renderHook(() => useLoginViewModel());

      act(() => result.current.handleEmailChange('test@example.com'));
      await act(async () => {
        await result.current.handleSignIn();
      });

      expect(result.current.errorMessage).toBeTruthy();
      expect(AuthService.signIn).not.toHaveBeenCalled();
    });

    it('should call AuthService.signIn with trimmed email on valid input', async () => {
      (AuthService.signIn as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          id: '1',
          email: 'test@example.com',
          preferences: { theme: 'light', notifications: true },
        },
      });

      const { result } = renderHook(() => useLoginViewModel());

      act(() => result.current.handleEmailChange('  test@example.com  '));
      act(() => result.current.handlePasswordChange('password123'));
      await act(async () => {
        await result.current.handleSignIn();
      });

      expect(AuthService.signIn).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
    });

    it('should call setUser on successful sign in', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        preferences: { theme: 'light', notifications: true },
      };
      (AuthService.signIn as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const { result } = renderHook(() => useLoginViewModel());

      act(() => result.current.handleEmailChange('test@example.com'));
      act(() => result.current.handlePasswordChange('password123'));
      await act(async () => {
        await result.current.handleSignIn();
      });

      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
      expect(result.current.errorMessage).toBeNull();
    });

    it('should set errorMessage on failed sign in', async () => {
      (AuthService.signIn as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Incorrect email or password.',
      });

      const { result } = renderHook(() => useLoginViewModel());

      act(() => result.current.handleEmailChange('test@example.com'));
      act(() => result.current.handlePasswordChange('wrongpassword'));
      await act(async () => {
        await result.current.handleSignIn();
      });

      expect(result.current.errorMessage).toBe('Incorrect email or password.');
      expect(mockSetUser).not.toHaveBeenCalled();
    });

    it('should set isLoading to false after sign in completes', async () => {
      (AuthService.signIn as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Error',
      });

      const { result } = renderHook(() => useLoginViewModel());

      act(() => result.current.handleEmailChange('test@example.com'));
      act(() => result.current.handlePasswordChange('pass'));
      await act(async () => {
        await result.current.handleSignIn();
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});
