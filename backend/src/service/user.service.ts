import {
  inArray,
  InferInsertModel,
  InferSelectModel,
  asc,
  eq,
  and,
  or,
  desc,
  getTableColumns,
} from 'drizzle-orm';
import {
  usersTable,
  emailVerificationTable,
  reservationTable,
  reviewTable,
} from '../db/schema';
import { db } from '../db';
import createHttpError from 'http-errors';
import { hashPassword } from '../utils/hash';
import ReservationService from './reservation.service';

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

export type NewReview = InferInsertModel<typeof reviewTable>;

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
      .select({
        otp: emailVerificationTable.otp,
        sendTime: emailVerificationTable.sendTime,
      })
      .from(emailVerificationTable)
      .orderBy(desc(emailVerificationTable.id))
      .where(eq(emailVerificationTable.email, data.email))
      .limit(1);
    if (query.length === 0) {
      throw createHttpError.Unauthorized('Invalid or expired OTP');
    }
    const { otp, sendTime } = query[0];
    const currentTime = new Date();
    const timeDiff =
      (currentTime.getTime() - new Date(sendTime).getTime()) / 1000;
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

  // Change the value to default "deleted" values since the schema reject null
  static async softDeleteUser(userId: number): Promise<User | null> {
    return await db.transaction(async (tx) => {
      // Soft delete user
      const result = await tx
        .update(usersTable)
        .set({
          firstName: 'Deleted',
          lastName: 'User',
          email: `deleted_${userId}@gmail.com`,
          phoneNo: '0000000000',
          password: '',
          displayName: 'Deleted User',
          profileUrl: null,
          refreshToken: null,
          isDeleted: true,
        })
        .where(eq(usersTable.id, userId))
        .returning();

      if (!result || result.length === 0) return null;

      // Find all unconfirmed reservations
      const reservations = await tx
        .select()
        .from(reservationTable)
        .where(
          and(
            eq(reservationTable.userId, userId),
            or(
              eq(reservationTable.status, 'unconfirmed'),
              eq(reservationTable.status, 'confirmed'),
            ),
          ),
        );

      // Force cancel them one by one (even if violate the 24-hour constraint)
      for (const r of reservations) {
        await tx
          .update(reservationTable)
          .set({ status: 'cancelled' })
          .where(eq(reservationTable.id, r.id));
      }

      return result[0];
    });
  }

  static async isUserDeleted(id: number): Promise<boolean> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    if (!user) {
      throw createHttpError.NotFound('User not found');
    }
    return user.isDeleted;
  }

  static async updateUser(data: NewUser): Promise<void> {
    let query = await db
      .select({ lastName: usersTable.lastName })
      .from(usersTable)
      .where(eq(usersTable.id, data.id!));

    if (query.length === 0) {
      throw createHttpError.NotFound('User not found');
    }

    await db
      .update(usersTable)
      .set({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNo: data.phoneNo,
        displayName: data.displayName,
        profileUrl: data.profileUrl,
      })
      .where(eq(usersTable.id, data.id!));
  }

  static async getUserById(id: number): Promise<User | undefined> {
    const rows = await db
      .select(non_sensitive_user_fields)
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    return rows[0];
  }

  static async createReview(data: NewReview): Promise<void> {
    let reservation = await db
      .select()
      .from(reservationTable)
      .where(eq(reservationTable.id, data.reservationId))
      .limit(1);
    if (reservation.length === 0) {
      throw createHttpError.NotFound('Reservation not found');
    }
    let review = await db
      .select()
      .from(reviewTable)
      .where(eq(reviewTable.reservationId, data.reservationId))
      .limit(1);
    if (review.length > 0) {
      throw createHttpError.Conflict(
        'Review for this reservation already exists',
      );
    }
    await db.insert(reviewTable).values(data);
  }

static async deleteReview(reviewId: number, userId: number): Promise<void> {
  //console.log('deleteReview called with:', { reviewId, userId });

  const review = await db
    .select({
      id: reviewTable.id,
      reservationId: reviewTable.reservationId,
    })
    .from(reviewTable)
    .where(eq(reviewTable.id, reviewId))
    .limit(1);

  //console.log('review found:', review);

  if (review.length === 0) {
    throw createHttpError.NotFound('Review not found');
  }

  const reservation = await db
    .select({
      userId: reservationTable.userId,
    })
    .from(reservationTable)
    .where(eq(reservationTable.id, review[0].reservationId))
    .limit(1);

  //console.log('reservation found:', reservation);

  if (reservation.length === 0) {
    throw createHttpError.NotFound('Reservation not found');
  }

  if (reservation[0].userId !== userId) {
    throw createHttpError.Forbidden('You can only delete your own review');
  }

  await db.delete(reviewTable).where(eq(reviewTable.id, reviewId));
  //console.log('review deleted successfully');
}


}
