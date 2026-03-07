import { AuthFormBase, AuthTextChangeHandler } from '../../models';

export interface SignUpViewProps {
  onSignInPress: () => void;
}

export interface SignUpViewModelReturn extends AuthFormBase {
  email: string;
  password: string;
  confirmPassword: string;
  handleEmailChange: AuthTextChangeHandler;
  handlePasswordChange: AuthTextChangeHandler;
  handleConfirmPasswordChange: AuthTextChangeHandler;
  handleSignUp: () => Promise<void>;
}
