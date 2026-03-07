import { AuthFormBase, AuthTextChangeHandler } from '../../models';

export interface ForgotPasswordViewProps {
  onBackToSignInPress: () => void;
}

export interface ForgotPasswordViewModelReturn extends AuthFormBase {
  email: string;
  isSuccess: boolean;
  handleEmailChange: AuthTextChangeHandler;
  handleSendResetEmail: () => Promise<void>;
}
