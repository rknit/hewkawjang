import { InferInsertModel, InferSelectModel, asc, eq } from 'drizzle-orm';
import { usersTable } from '../db/schema';
import { db } from '../db';
import createHttpError from 'http-errors';

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
    let dup = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, data.email))
      .limit(1);
    if (dup.length > 0) {
      throw createHttpError.Conflict('Email already exists');
    }

    let [newUser] = await db.insert(usersTable).values(data).returning();
    return newUser;
  }
}
