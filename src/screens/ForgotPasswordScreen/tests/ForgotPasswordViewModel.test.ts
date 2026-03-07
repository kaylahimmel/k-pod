import { renderHook, act } from '@testing-library/react-native';
import { useForgotPasswordViewModel } from '../ForgotPasswordViewModel';

import { AuthService } from '../../../services';

jest.mock('../../../services', () => ({
  AuthService: {
    sendPasswordResetEmail: jest.fn(),
  },
}));

describe('useForgotPasswordViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialise with empty email and no error', () => {
    const { result } = renderHook(() => useForgotPasswordViewModel());

    expect(result.current.email).toBe('');
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });

  it('should update email and clear error on handleEmailChange', () => {
    const { result } = renderHook(() => useForgotPasswordViewModel());

    act(() => result.current.handleEmailChange('test@example.com'));

    expect(result.current.email).toBe('test@example.com');
    expect(result.current.errorMessage).toBeNull();
  });

  describe('handleSendResetEmail', () => {
    it('should set errorMessage for an invalid email', async () => {
      const { result } = renderHook(() => useForgotPasswordViewModel());

      act(() => result.current.handleEmailChange('not-an-email'));
      await act(async () => {
        await result.current.handleSendResetEmail();
      });

      expect(result.current.errorMessage).toBeTruthy();
      expect(AuthService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should set isSuccess to true on success', async () => {
      (AuthService.sendPasswordResetEmail as jest.Mock).mockResolvedValue({
        success: true,
        data: undefined,
      });

      const { result } = renderHook(() => useForgotPasswordViewModel());

      act(() => result.current.handleEmailChange('test@example.com'));
      await act(async () => {
        await result.current.handleSendResetEmail();
      });

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.errorMessage).toBeNull();
    });

    it('should set errorMessage on failure', async () => {
      (AuthService.sendPasswordResetEmail as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Incorrect email or password.',
      });

      const { result } = renderHook(() => useForgotPasswordViewModel());

      act(() => result.current.handleEmailChange('unknown@example.com'));
      await act(async () => {
        await result.current.handleSendResetEmail();
      });

      expect(result.current.errorMessage).toBe('Incorrect email or password.');
      expect(result.current.isSuccess).toBe(false);
    });
  });
});
