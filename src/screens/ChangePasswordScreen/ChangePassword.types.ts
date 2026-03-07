import { AuthFormBase, AuthTextChangeHandler } from '../../models';

export interface ChangePasswordViewProps {
  onSuccess: () => void;
}

export interface ChangePasswordViewModelReturn extends AuthFormBase {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  isSuccess: boolean;
  handleCurrentPasswordChange: AuthTextChangeHandler;
  handleNewPasswordChange: AuthTextChangeHandler;
  handleConfirmNewPasswordChange: AuthTextChangeHandler;
  handleSubmit: () => Promise<void>;
}
