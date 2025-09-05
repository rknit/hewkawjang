import { DrizzleQueryError } from 'drizzle-orm';
import { PostgresError } from 'postgres';

export function asPostgresError(error: any): PostgresError | undefined {
  if (error instanceof PostgresError) {
    return error;
  }

  if (error instanceof DrizzleQueryError) {
    const cause = error.cause;
    if (cause instanceof PostgresError) {
      return cause;
    }
  }

  return undefined;
}

export function checkPostgresError(
  error: any,
  pred: (err: PostgresError) => boolean | undefined,
): boolean {
  const pgError = asPostgresError(error);
  if (pgError) {
    return pred(pgError) ?? false;
  }
  return false;
}
