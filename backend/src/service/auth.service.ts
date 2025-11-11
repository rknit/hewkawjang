import { eq } from 'drizzle-orm';
import { adminsTable, usersTable } from '../db/schema';
import { comparePassword } from '../utils/hash';
import { genJwtTokens, JwtTokens } from '../utils/jwt';
import { db } from '../db';
import createHttpError from 'http-errors';
import type { UserAuthPayload } from '../validators/auth.validator';
import { Admin } from '../validators/admin.validator';

export type LoginUser = {
  email: string;
  password: string;
};

export default class AuthService {
  static async login(data: LoginUser): Promise<JwtTokens> {
    // Check for admin first
    const [admin] = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.email, data.email));
    if (admin) {
      return this.loginAdmin(data, admin);
    }

    const [user] = await db
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

    const payload: UserAuthPayload = {
      userId: user.id,
      sub: `user-${user.id}`,
      role: 'authenticated',
      authRole: 'user',
    };
    const tokens = genJwtTokens(payload);

    // Store refresh token in database
    await db
      .update(usersTable)
      .set({ refreshToken: tokens.refreshToken })
      .where(eq(usersTable.id, user.id));

    return tokens;
  }

  private static async loginAdmin(
    data: LoginUser,
    admin: Admin,
  ): Promise<JwtTokens> {
    const isMatch = await comparePassword(data.password, admin.password);
    if (!isMatch) {
      throw createHttpError.Unauthorized('Invalid email or password');
    }

    const payload: UserAuthPayload = {
      userId: admin.id,
      sub: `admin-${admin.id}`,
      role: 'authenticated',
      authRole: 'admin',
    };
    const tokens = genJwtTokens(payload);

    // Store refresh token in database
    await db
      .update(adminsTable)
      .set({ refreshToken: tokens.refreshToken })
      .where(eq(adminsTable.id, admin.id));

    return tokens;
  }

  static async logout(data: UserAuthPayload): Promise<void> {
    switch (data.authRole) {
      case 'user':
        return this.logoutUser(data);
      case 'admin':
        return this.logoutAdmin(data);
      default:
        throw createHttpError.BadRequest('Invalid auth role');
    }
  }

  private static async logoutUser(data: UserAuthPayload): Promise<void> {
    const result = await db
      .update(usersTable)
      .set({ refreshToken: null })
      .where(eq(usersTable.id, data.userId))
      .returning({ id: usersTable.id });

    if (result.length === 0) {
      throw createHttpError.NotFound('User not found or already logged out');
    }
  }

  private static async logoutAdmin(data: UserAuthPayload): Promise<void> {
    const result = await db
      .update(adminsTable)
      .set({ refreshToken: null })
      .where(eq(adminsTable.id, data.userId))
      .returning({ id: adminsTable.id });

    if (result.length === 0) {
      throw createHttpError.NotFound('Admin not found or already logged out');
    }
  }

  static async refreshTokens(
    refreshToken: string,
    data: UserAuthPayload,
  ): Promise<JwtTokens> {
    switch (data.authRole) {
      case 'user':
        return this.refreshUser(refreshToken, data);
      case 'admin':
        return this.refreshAdmin(refreshToken, data);
      default:
        throw createHttpError.BadRequest('Invalid auth role');
    }
  }

  private static async refreshUser(
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

    const payload: UserAuthPayload = {
      userId: user.id,
      sub: `user-${user.id}`,
      role: 'authenticated',
      authRole: 'user',
    };
    const tokens = genJwtTokens(payload);

    // Store refresh token in database
    await db
      .update(usersTable)
      .set({ refreshToken: tokens.refreshToken })
      .where(eq(usersTable.id, user.id));

    return tokens;
  }

  private static async refreshAdmin(
    refreshToken: string,
    data: UserAuthPayload,
  ): Promise<JwtTokens> {
    const [admin] = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.id, data.userId));
    if (!admin || !admin.refreshToken || admin.refreshToken !== refreshToken) {
      throw createHttpError.Unauthorized();
    }

    const payload: UserAuthPayload = {
      userId: admin.id,
      sub: `admin-${admin.id}`,
      role: 'authenticated',
      authRole: 'admin',
    };
    const tokens = genJwtTokens(payload);

    // Store refresh token in database
    await db
      .update(adminsTable)
      .set({ refreshToken: tokens.refreshToken })
      .where(eq(adminsTable.id, admin.id));

    return tokens;
  }
}
