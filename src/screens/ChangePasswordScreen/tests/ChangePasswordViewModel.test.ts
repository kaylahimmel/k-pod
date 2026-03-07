import { renderHook, act } from '@testing-library/react-native';
import { useChangePasswordViewModel } from '../ChangePasswordViewModel';

import { AuthService } from '../../../services';

jest.mock('../../../services', () => ({
  AuthService: {
    changePassword: jest.fn(),
  },
}));

describe('useChangePasswordViewModel', () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialise with empty fields and no error', () => {
    const { result } = renderHook(() =>
      useChangePasswordViewModel(mockOnSuccess),
    );

    expect(result.current.currentPassword).toBe('');
    expect(result.current.newPassword).toBe('');
    expect(result.current.confirmNewPassword).toBe('');
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });

  describe('handleSubmit', () => {
    it('should set errorMessage when current password is empty', async () => {
      const { result } = renderHook(() =>
        useChangePasswordViewModel(mockOnSuccess),
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errorMessage).toBeTruthy();
      expect(AuthService.changePassword).not.toHaveBeenCalled();
    });

    it('should set errorMessage when new password is too short', async () => {
      const { result } = renderHook(() =>
        useChangePasswordViewModel(mockOnSuccess),
      );

      act(() => result.current.handleCurrentPasswordChange('currentPass'));
      act(() => result.current.handleNewPasswordChange('abc'));
      act(() => result.current.handleConfirmNewPasswordChange('abc'));
      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errorMessage).toBeTruthy();
      expect(AuthService.changePassword).not.toHaveBeenCalled();
    });

    it('should set errorMessage when passwords do not match', async () => {
      const { result } = renderHook(() =>
        useChangePasswordViewModel(mockOnSuccess),
      );

      act(() => result.current.handleCurrentPasswordChange('currentPass'));
      act(() => result.current.handleNewPasswordChange('newPassword1'));
      act(() => result.current.handleConfirmNewPasswordChange('newPassword2'));
      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errorMessage).toBe('Passwords do not match.');
      expect(AuthService.changePassword).not.toHaveBeenCalled();
    });

    it('should set isSuccess and call onSuccess after delay on success', async () => {
      (AuthService.changePassword as jest.Mock).mockResolvedValue({
        success: true,
        data: undefined,
      });

      const { result } = renderHook(() =>
        useChangePasswordViewModel(mockOnSuccess),
      );

      act(() => result.current.handleCurrentPasswordChange('currentPass'));
      act(() => result.current.handleNewPasswordChange('newPassword1'));
      act(() => result.current.handleConfirmNewPasswordChange('newPassword1'));
      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.isSuccess).toBe(true);

      act(() => jest.advanceTimersByTime(1500));

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });

    it('should set errorMessage on failure from AuthService', async () => {
      (AuthService.changePassword as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Incorrect email or password.',
      });

      const { result } = renderHook(() =>
        useChangePasswordViewModel(mockOnSuccess),
      );

      act(() => result.current.handleCurrentPasswordChange('wrongCurrentPass'));
      act(() => result.current.handleNewPasswordChange('newPassword1'));
      act(() => result.current.handleConfirmNewPasswordChange('newPassword1'));
      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errorMessage).toBe('Incorrect email or password.');
      expect(result.current.isSuccess).toBe(false);
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
});
