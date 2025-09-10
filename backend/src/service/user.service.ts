import {
  inArray,
  InferInsertModel,
  InferSelectModel,
  asc,
  eq,
  desc,
  getTableColumns,
} from 'drizzle-orm';
import { usersTable, emailVerificationTable } from '../db/schema';
import { db } from '../db';
import createHttpError from 'http-errors';
import { hashPassword } from '../utils/hash';

// excludes sensitive fields from User type
type ExcludeFromUser = {
  password: string;
  refreshToken: string | null;
};
const {
  password: _p,
  refreshToken: _r,
  ...non_sensitive_user_fields
} = getTableColumns(usersTable);

export type User = Omit<
  InferSelectModel<typeof usersTable>,
  keyof ExcludeFromUser
>;

export type NewUser = InferInsertModel<typeof usersTable>;

export default class UserService {
  static async getUsers(
    props: { ids?: number[]; offset?: number; limit?: number } = {},
  ): Promise<User[]> {
    let offset = props.offset ?? 0;
    let limit = props.limit ?? 10;

    let query = db
      .select(non_sensitive_user_fields)
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
    let [newUser] = await db
      .insert(usersTable)
      .values(data)
      .returning(non_sensitive_user_fields);
    return newUser;
  }

  static async registerUser(data: NewUser, otpSend: string): Promise<User> {
    let dup = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, data.email))
      .limit(1);
    if (dup.length > 0) {
      throw createHttpError.Conflict('Email already exists');
    }
    let query = await db
      .select({ otp: emailVerificationTable.otp, sendTime: emailVerificationTable.sendTime })
      .from(emailVerificationTable)
      .orderBy(desc(emailVerificationTable.id))
      .where(eq(emailVerificationTable.email, data.email))
      .limit(1);
    if (query.length === 0) {
      throw createHttpError.Unauthorized('Invalid or expired OTP');
    }
    const { otp, sendTime } = query[0];
    const currentTime = new Date();
    const timeDiff = (currentTime.getTime() - new Date(sendTime).getTime()) / 1000;
    if (otp !== otpSend || timeDiff > 180) {
      throw createHttpError.Unauthorized('Invalid or expired OTP');
    }
    data.password = await hashPassword(data.password);
    let [newUser] = await db
      .insert(usersTable)
      .values(data)
      .returning(non_sensitive_user_fields);
    return newUser;
  }
}
