import { inArray, InferInsertModel, InferSelectModel, asc } from 'drizzle-orm';
import { usersTable } from '../db/schema';
import { db } from '../db';

export type User = InferSelectModel<typeof usersTable>;
export type NewUser = InferInsertModel<typeof usersTable>;

export default class UserService {
  static async getUsers(
    props: { ids?: number[]; offset?: number; limit?: number } = {},
  ): Promise<User[]> {
    let offset = props.offset ?? 0;
    let limit = props.limit ?? 10;

    if (!props.ids) {
      return await db
        .select()
        .from(usersTable)
        .orderBy(asc(usersTable.id))
        .offset(offset)
        .limit(limit);
    }

    return await db
      .select()
      .from(usersTable)
      .where(inArray(usersTable.id, props.ids))
      .orderBy(asc(usersTable.id))
      .offset(offset)
      .limit(limit);
  }

  static async createUsers(data: NewUser[]): Promise<User[]> {
    return await db.insert(usersTable).values(data).returning();
  }
}
