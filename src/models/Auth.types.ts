/**
 * Shared handler type for text input change callbacks used across auth forms.
 */
export type AuthTextChangeHandler = (text: string) => void;

/**
 * Base interface shared by all auth form ViewModelReturn types.
 * Captures the common error/loading state present in every auth screen.
 */
export interface AuthFormBase {
  errorMessage: string | null;
  isLoading: boolean;
}
