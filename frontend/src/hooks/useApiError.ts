import type { AxiosError } from 'axios';

import type { ApiError } from '../types';

/**
 * Extracts a human-readable error message from an Axios API error.
 *
 * Handles:
 * 1. The standard API error envelope: { error: { code, message, details? } }
 * 2. Network errors (no response from server)
 * 3. Unknown errors
 *
 * Usage:
 *   const { getErrorMessage } = useApiError();
 *   const message = getErrorMessage(error);
 */
export function useApiError(): { getErrorMessage: (error: unknown) => string } {
  const getErrorMessage = (error: unknown): string => {
    if (error === null || error === undefined) {
      return 'An unexpected error occurred.';
    }

    // Axios error with a response body
    if (isAxiosError(error)) {
      if (error.response !== undefined) {
        const data = error.response.data as unknown;
        if (isApiError(data)) {
          return data.error.message;
        }
        // Fall through to generic message if shape doesn't match
      }

      // Network error — no response received
      if (error.request !== undefined) {
        return 'Unable to reach the server. Check your connection and try again.';
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred.';
  };

  return { getErrorMessage };
}

// ── Type guards ────────────────────────────────────────────────────────────────

function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as Record<string, unknown>)['isAxiosError'] === true
  );
}

function isApiError(data: unknown): data is ApiError {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as Record<string, unknown>)['error'] === 'object'
  );
}
