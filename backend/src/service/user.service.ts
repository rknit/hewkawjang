import { InferInsertModel, InferSelectModel, asc, eq } from 'drizzle-orm';
import { usersTable } from '../db/schema';
import { db } from '../db';
import createHttpError from 'http-errors';
import { checkPostgresError } from '../utils/http-helper';

export type User = InferSelectModel<typeof usersTable>;
export type NewUser = InferInsertModel<typeof usersTable>;

export default class UserService {
  static async getUser(
    props: { id?: number; offset?: number; limit?: number } = {},
  ): Promise<User[]> {
    let offset = props.offset ?? 0;
    let limit = props.limit ?? 10;

    let query = db
      .select()
      .from(usersTable)
      .orderBy(asc(usersTable.id))
      .offset(offset)
      .limit(limit);

    if (props.id) {
      return await query.where(eq(usersTable.id, props.id));
    }
    return await query;
  }

  static async createUser(data: NewUser): Promise<User> {
    try {
      let [newUser] = await db.insert(usersTable).values(data).returning();
      return newUser;
    } catch (error) {
      // check if error is due to duplicate email
      if (
        checkPostgresError(
          error,
          (error) => error.code === '23505' && error.detail?.includes('email'),
        )
      ) {
        throw createHttpError.Conflict('Email already exists');
      }

      throw error;
    }
  }
}
