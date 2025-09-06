import {
  inArray,
  InferInsertModel,
  InferSelectModel,
  asc,
  eq,
} from 'drizzle-orm';
import { usersTable } from '../db/schema';
import { db } from '../db';
import createHttpError from 'http-errors';

export type User = InferSelectModel<typeof usersTable>;
export type NewUser = InferInsertModel<typeof usersTable>;

export default class UserService {
  static async getUsers(
    props: { ids?: number[]; offset?: number; limit?: number } = {},
  ): Promise<User[]> {
    let offset = props.offset ?? 0;
    let limit = props.limit ?? 10;

    let query = db
      .select()
      .from(usersTable)
      .orderBy(asc(usersTable.id))
      .offset(offset)
      .limit(limit);

    if (props.ids && props.ids.length > 0) {
      return await query.where(inArray(usersTable.id, props.ids));
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

  /*
    In our documentation, it states that user's information should be changed to NULL, but in schema, it is not allowed to be NULL.
    Therefore, I set default values for soft deleted users. 
  */
  static async softDeleteUser(userId: number): Promise<void> {
    try {
      const result = await db.update(usersTable)
        .set({
          firstName: 'Deleted',
          lastName: 'User',
          email: `deleted_${userId}@gmail.com`,
          phone_no: '0000000000',
          displayName: 'Deleted User',
          profileUrl: null,
        })
        .where(eq(usersTable.id, userId))
        .returning();
    } catch (error) {
      console.error('Error soft deleting user:', error);
      throw new Error('Could not soft delete user');
    }
  }
}
