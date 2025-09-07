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
import { hashPassword, comparePassword } from '../utils/hash';
import { generateVerificationToken, sendVerifiedEmail } from './mailer.service';
import jwt from 'jsonwebtoken';

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

    data.password = await hashPassword(data.password);
    let [newUser] = await db.insert(usersTable).values(data).returning();
    try {
      const token = generateVerificationToken(data.email);
      await sendVerifiedEmail(data.email, token);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Decide how to handle this. You could delete the user or mark them for re-verification.
      // For now, we'll let the user be created but log the error.
    }
    return newUser;
  }
  static async verifyUser(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        email: string;
      };
      const userEmail = decoded.email;

      // Find user by email
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, userEmail))
        .limit(1);

      if (!user) {
        throw createHttpError.NotFound('User to verify not found.');
      }

      if (user.isVerified) {
        // User is already verified, just return the user data.
        return user;
      }

      // Update the user to set isVerified to true
      const [verifiedUser] = await db
        .update(usersTable)
        .set({ isVerified: true })
        .where(eq(usersTable.email, userEmail))
        .returning();

      return verifiedUser;
    } catch (error) {
      // Catches JWT errors (expired, invalid, etc.)
      console.error('Verification token error:', error);
      throw createHttpError.BadRequest('Invalid or expired verification link.');
    }
  }
  static async loginUser(data: User): Promise<User> {
    let loginUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, data.email));
    if (loginUser.length === 0) {
      throw createHttpError.Unauthorized('Invalid email or password');
    }
    const isMatch = await comparePassword(data.password, loginUser[0].password);
    if (!isMatch) {
      throw createHttpError.Unauthorized('Invalid email or password');
    }
    if (!loginUser[0].isVerified) {
      try {
        const token = generateVerificationToken(data.email);
        await sendVerifiedEmail(data.email, token);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Decide how to handle this. You could delete the user or mark them for re-verification.
        // For now, we'll let the user be created but log the error.
      }
    }
    return loginUser[0];
  }
}
