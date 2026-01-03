/**
 * Generic result type for operations that can fail
 * Using a Result pattern helps handle errors gracefully without throwing
 */
export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
