import {
  inArray,
  InferInsertModel,
  InferSelectModel,
  asc,
  eq,
} from 'drizzle-orm';
import { usersAuthTable, usersTable } from '../db/schema';
import { db } from '../db';
import createHttpError from 'http-errors';
import { hashPassword, comparePassword } from '../utils/hash';
import { genJwtTokens, JwtTokens } from '../utils/jwt';

export type User = InferSelectModel<typeof usersTable>;
export type NewUser = InferInsertModel<typeof usersTable>;

export type LoginUser = {
  email: string;
  password: string;
};

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
    data.password = await hashPassword(data.password);
    let [newUser] = await db.insert(usersTable).values(data).returning();
    return newUser;
  }

  static async loginUser(data: LoginUser): Promise<JwtTokens> {
    let loginUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, data.email));
    if (loginUser.length === 0) {
      throw createHttpError.Unauthorized('Invalid email or password');
    }
    let user = loginUser[0];

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) {
      throw createHttpError.Unauthorized('Invalid email or password');
    }

    const tokens = genJwtTokens(user);

    // Store refresh token in database
    await db
      .insert(usersAuthTable)
      .values({ userId: user.id, refreshToken: tokens.refresh_token })
      .onConflictDoUpdate({
        target: usersAuthTable.userId,
        set: { refreshToken: tokens.refresh_token },
      });

    return tokens;
  }
}
