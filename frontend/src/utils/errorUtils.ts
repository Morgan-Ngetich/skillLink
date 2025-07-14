import { ApiError } from '@/client'; // adjust path to your ApiError
import { type ToastOptions } from '@/hooks/useToaster';

interface ApiErrorBody {
  detail?: string;
  [key: string]: unknown;
}
// Type guard to check if error is ApiError based on your ApiError properties
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'body' in error &&
    typeof (error as ApiError).body === 'object'
  );
}

// Get meaningful error message from ApiError or fallback message
export function getApiErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return (error.body as ApiErrorBody)?.detail || error.message || "Please try again.";
  }
  if (error instanceof Error) {
    return error.message || "Please try again.";
  }
  return "Please try again.";
}


/**
 * Handles API errors by showing a toast notification.
 * Accepts any error type, safely detects ApiError,
 * and shows a default message if unknown error.
 */
export function handleApiError(error: unknown, toast: (options: ToastOptions) => void) {
  toast({
    id: 'api-error',
    title: 'Request failed',
    description: getApiErrorMessage(error),
    status: 'error',
  });
}
