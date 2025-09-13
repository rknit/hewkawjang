import { ZodError } from 'zod';

export function normalizeError(error: any): null {
  const isDev = __DEV__;

  // TODO: Handle api errors more gracefully

  // Check if it's a Zod validation error
  if (error instanceof ZodError) {
    if (isDev) {
      console.error('Schema validation failed:', error.issues);
      throw new Error(
        `Schema mismatch: ${error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
      );
    } else {
      console.warn('Schema validation failed in production, suppressing error');
      return null;
    }
  }

  // Re-throw other unexpected errors
  throw error;
}
