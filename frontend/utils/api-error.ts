import { isAxiosError } from 'axios';
import { ZodError } from 'zod';

export type ApiError = {
  type: 'api' | 'validation' | 'network' | 'unknown';
  message: string;
  status?: number; // HTTP status code if available
  issues?: any; // Zod validation issues
};

export function normalizeApiError(error: unknown): ApiError {
  // Axios error
  if (isAxiosError(error)) {
    if (!error.response) {
      return {
        type: 'network',
        message: 'Network error or no response from server',
      };
    }
    return {
      type: 'api',
      status: error.response.status,
      message:
        error.response.data?.message ||
        `Request failed with status ${error.response.status}`,
    };
  }

  // Zod validation error
  if (error instanceof ZodError) {
    return {
      type: 'validation',
      message: 'Invalid response data format',
      issues: error.issues,
    };
  }

  // Fallback
  return {
    type: 'unknown',
    message: (error as Error)?.message || 'An unexpected error occurred',
  };
}
