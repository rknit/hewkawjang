import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { usersProfileTable, usersTable } from '../db/schema';
import { db } from '../db';

export type User = InferSelectModel<typeof usersTable>;
export type NewUser = InferInsertModel<typeof usersTable>;

export default class UserService {
  static getUsers(
    props: { offset?: number; limit?: number } = {},
  ): Promise<User[]> {
    return db
      .select()
      .from(usersTable)
      .offset(props.offset ?? 0)
      .limit(props.limit ?? 10);
  }

  static async createUsers(data: NewUser[]): Promise<User[]> {
    return await db.transaction(async (tx) => {
      const insertedUsers = await tx
        .insert(usersTable)
        .values(data)
        .returning();

      const profileData = insertedUsers.map((user) => ({
        userId: user.id,
        displayName: user.firstName,
      }));

      await tx.insert(usersProfileTable).values(profileData);

      return insertedUsers;
    });
  }
}
