import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { usersTable } from '../db/schema';
import { db } from '../db';

export type User = InferSelectModel<typeof usersTable>;
export type NewUser = InferInsertModel<typeof usersTable>;

export default class UserService {
  static async getUsers(): Promise<User[]> {
    return await db.select().from(usersTable);
  }

  static async createUsers(data: NewUser[]): Promise<User[]> {
    return await db.insert(usersTable).values(data).returning();
  }
}
