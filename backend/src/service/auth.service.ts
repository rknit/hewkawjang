import { eq } from 'drizzle-orm';
import { usersTable } from '../db/schema';
import { comparePassword } from '../utils/hash';
import { genJwtTokens, JwtTokens } from '../utils/jwt';
import { db } from '../db';
import createHttpError from 'http-errors';

export type LoginUser = {
  email: string;
  password: string;
};

export type UserAuthPayload = {
  userId: number;
};

export default class AuthService {
  static async loginUser(data: LoginUser): Promise<JwtTokens> {
    let [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, data.email));
    if (!user) {
      throw createHttpError.Unauthorized('Invalid email or password');
    }

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) {
      throw createHttpError.Unauthorized('Invalid email or password');
    }

    const payload: UserAuthPayload = { userId: user.id };
    const tokens = genJwtTokens(payload);

    // Store refresh token in database
    await db
      .update(usersTable)
      .set({ refreshToken: tokens.refreshToken })
      .where(eq(usersTable.id, user.id));

    return tokens;
  }

  static async logoutUser(data: UserAuthPayload): Promise<void> {
    const result = await db
      .update(usersTable)
      .set({ refreshToken: null })
      .where(eq(usersTable.id, data.userId))
      .returning({ id: usersTable.id });

    if (result.length === 0) {
      throw createHttpError.NotFound('User not found or already logged out');
    }
  }


  static async refreshTokens(
    refreshToken: string,
    data: UserAuthPayload,
  ): Promise<JwtTokens> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, data.userId));
    if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
      throw createHttpError.Unauthorized();
    }

    const payload: UserAuthPayload = { userId: user.id };
    const tokens = genJwtTokens(payload);

    // Store refresh token in database
    await db
      .update(usersTable)
      .set({ refreshToken: tokens.refreshToken })
      .where(eq(usersTable.id, user.id));

    return tokens;
  }
}
