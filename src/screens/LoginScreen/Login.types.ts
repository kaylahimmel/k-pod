import { AuthFormBase, AuthTextChangeHandler } from '../../models';

export interface LoginViewProps {
  onSignUpPress: () => void;
  onForgotPasswordPress: () => void;
}

export interface LoginViewModelReturn extends AuthFormBase {
  email: string;
  password: string;
  handleEmailChange: AuthTextChangeHandler;
  handlePasswordChange: AuthTextChangeHandler;
  handleSignIn: () => Promise<void>;
}
