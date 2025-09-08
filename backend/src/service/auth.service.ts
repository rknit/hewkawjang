import { eq } from 'drizzle-orm';
import { usersTable, usersAuthTable } from '../db/schema';
import { comparePassword } from '../utils/hash';
import { genJwtTokens, JwtTokens } from '../utils/jwt';
import { db } from '../db';
import createHttpError from 'http-errors';

export type LoginUser = {
  email: string;
  password: string;
};

export default class AuthService {
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
