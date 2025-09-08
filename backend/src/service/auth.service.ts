import { and, eq } from 'drizzle-orm';
import { usersTable } from '../db/schema';
import { comparePassword } from '../utils/hash';
import {
  genJwtAccessToken,
  genJwtTokens,
  JwtPayload,
  JwtTokens,
} from '../utils/jwt';
import { db } from '../db';
import createHttpError from 'http-errors';

export type LoginUser = {
  email: string;
  password: string;
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

    const tokens = genJwtTokens({
      userEmail: user.email,
      userId: user.id,
    });

    // Store refresh token in database
    await db
      .update(usersTable)
      .set({ refreshToken: tokens.refresh_token })
      .where(eq(usersTable.id, user.id));

    return tokens;
  }

  static async refreshTokens(
    refreshToken: string,
    data: JwtPayload,
  ): Promise<JwtTokens> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.id, data.userId),
          eq(usersTable.email, data.userEmail),
        ),
      );
    if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
      throw createHttpError.Unauthorized();
    }

    const tokens = genJwtTokens({
      userEmail: user.email,
      userId: user.id,
    });

    // Store refresh token in database
    await db
      .update(usersTable)
      .set({ refreshToken: tokens.refresh_token })
      .where(eq(usersTable.id, user.id));

    return tokens;
  }
}
