import { renderHook, act } from '@testing-library/react-native';
import { useSignUpViewModel } from '../SignUpViewModel';

import { useAuthStore } from '../../../hooks';
import { AuthService } from '../../../services';

jest.mock('../../../hooks', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../../services', () => ({
  AuthService: {
    signUp: jest.fn(),
  },
}));

const mockSetUser = jest.fn();

describe('useSignUpViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as jest.Mock).mockReturnValue({ setUser: mockSetUser });
  });

  it('should initialise with empty fields and no error', () => {
    const { result } = renderHook(() => useSignUpViewModel());

    expect(result.current.email).toBe('');
    expect(result.current.password).toBe('');
    expect(result.current.confirmPassword).toBe('');
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should update email and clear error on handleEmailChange', () => {
    const { result } = renderHook(() => useSignUpViewModel());

    act(() => result.current.handleEmailChange('test@example.com'));

    expect(result.current.email).toBe('test@example.com');
    expect(result.current.errorMessage).toBeNull();
  });

  it('should update password and clear error on handlePasswordChange', () => {
    const { result } = renderHook(() => useSignUpViewModel());

    act(() => result.current.handlePasswordChange('password123'));

    expect(result.current.password).toBe('password123');
    expect(result.current.errorMessage).toBeNull();
  });

  it('should update confirmPassword and clear error on handleConfirmPasswordChange', () => {
    const { result } = renderHook(() => useSignUpViewModel());

    act(() => result.current.handleConfirmPasswordChange('password123'));

    expect(result.current.confirmPassword).toBe('password123');
    expect(result.current.errorMessage).toBeNull();
  });

  describe('handleSignUp', () => {
    it('should set errorMessage when email is invalid', async () => {
      const { result } = renderHook(() => useSignUpViewModel());

      act(() => result.current.handleEmailChange('not-an-email'));
      await act(async () => {
        await result.current.handleSignUp();
      });

      expect(result.current.errorMessage).toBeTruthy();
      expect(AuthService.signUp).not.toHaveBeenCalled();
    });

    it('should set errorMessage when password is empty', async () => {
      const { result } = renderHook(() => useSignUpViewModel());

      act(() => result.current.handleEmailChange('test@example.com'));
      await act(async () => {
        await result.current.handleSignUp();
      });

      expect(result.current.errorMessage).toBeTruthy();
      expect(AuthService.signUp).not.toHaveBeenCalled();
    });

    it('should set errorMessage when password is too short', async () => {
      const { result } = renderHook(() => useSignUpViewModel());

      act(() => result.current.handleEmailChange('test@example.com'));
      act(() => result.current.handlePasswordChange('abc'));
      act(() => result.current.handleConfirmPasswordChange('abc'));
      await act(async () => {
        await result.current.handleSignUp();
      });

      expect(result.current.errorMessage).toBe(
        'Password must be at least 6 characters.',
      );
      expect(AuthService.signUp).not.toHaveBeenCalled();
    });

    it('should set errorMessage when confirm password is empty', async () => {
      const { result } = renderHook(() => useSignUpViewModel());

      act(() => result.current.handleEmailChange('test@example.com'));
      act(() => result.current.handlePasswordChange('password123'));
      await act(async () => {
        await result.current.handleSignUp();
      });

      expect(result.current.errorMessage).toBeTruthy();
      expect(AuthService.signUp).not.toHaveBeenCalled();
    });

    it('should set errorMessage when passwords do not match', async () => {
      const { result } = renderHook(() => useSignUpViewModel());

      act(() => result.current.handleEmailChange('test@example.com'));
      act(() => result.current.handlePasswordChange('password1'));
      act(() => result.current.handleConfirmPasswordChange('password2'));
      await act(async () => {
        await result.current.handleSignUp();
      });

      expect(result.current.errorMessage).toBe('Passwords do not match.');
      expect(AuthService.signUp).not.toHaveBeenCalled();
    });

    it('should call AuthService.signUp with trimmed email on valid input', async () => {
      (AuthService.signUp as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          id: '1',
          email: 'test@example.com',
          preferences: { theme: 'light', notifications: true },
        },
      });

      const { result } = renderHook(() => useSignUpViewModel());

      act(() => result.current.handleEmailChange('  test@example.com  '));
      act(() => result.current.handlePasswordChange('password123'));
      act(() => result.current.handleConfirmPasswordChange('password123'));
      await act(async () => {
        await result.current.handleSignUp();
      });

      expect(AuthService.signUp).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
    });

    it('should call setUser on successful sign up', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        preferences: { theme: 'light', notifications: true },
      };
      (AuthService.signUp as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const { result } = renderHook(() => useSignUpViewModel());

      act(() => result.current.handleEmailChange('test@example.com'));
      act(() => result.current.handlePasswordChange('password123'));
      act(() => result.current.handleConfirmPasswordChange('password123'));
      await act(async () => {
        await result.current.handleSignUp();
      });

      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
      expect(result.current.errorMessage).toBeNull();
    });

    it('should set errorMessage on failed sign up', async () => {
      (AuthService.signUp as jest.Mock).mockResolvedValue({
        success: false,
        error: 'An account with this email already exists.',
      });

      const { result } = renderHook(() => useSignUpViewModel());

      act(() => result.current.handleEmailChange('test@example.com'));
      act(() => result.current.handlePasswordChange('password123'));
      act(() => result.current.handleConfirmPasswordChange('password123'));
      await act(async () => {
        await result.current.handleSignUp();
      });

      expect(result.current.errorMessage).toBe(
        'An account with this email already exists.',
      );
      expect(mockSetUser).not.toHaveBeenCalled();
    });

    it('should set isLoading to false after sign up completes', async () => {
      (AuthService.signUp as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Error',
      });

      const { result } = renderHook(() => useSignUpViewModel());

      act(() => result.current.handleEmailChange('test@example.com'));
      act(() => result.current.handlePasswordChange('password123'));
      act(() => result.current.handleConfirmPasswordChange('password123'));
      await act(async () => {
        await result.current.handleSignUp();
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});
