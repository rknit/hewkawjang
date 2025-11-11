import {
  InferSelectModel,
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  lt,
  sql,
} from 'drizzle-orm';
import createHttpError from 'http-errors';
import { db } from '../db';
import { reservationTable, restaurantTable ,usersTable } from '../db/schema';
import NotificationService from './notification.service';

export type Reservation = InferSelectModel<typeof reservationTable>;
export type Restaurant = InferSelectModel<typeof restaurantTable>;

export type ReservationWithRestaurant = Reservation & {
  restaurant: Restaurant;
};

export default class ReservationService {
  static async getUnconfirmedReservationsByRestaurant(props: {
    restaurantId: number;
    offset?: number;
  }): Promise<Reservation[]> {
    let restaurantId = props.restaurantId;
    let offset = props.offset ?? 0;

    let reservations = await db
      .select()
      .from(reservationTable)
      .where(
        and(
          eq(reservationTable.restaurantId, restaurantId),
          eq(reservationTable.status, 'unconfirmed'),
        ),
      )
      .offset(offset);

    return reservations;
  }

  static async getReservationsByRestaurant(props: {
    restaurantId: number;
    status?: Reservation['status'] | Reservation['status'][];
    offset?: number;
    limit?: number;
  }): Promise<Reservation[]> {
    const restaurantId = props.restaurantId;
    const status = props.status;
    const offset = props.offset ?? 0;
    const limit = props.limit ?? 50;

    const conditions: any[] = [eq(reservationTable.restaurantId, restaurantId)];

    if (status) {
      if (Array.isArray(status)) {
        conditions.push(
          inArray(reservationTable.status, status as Reservation['status'][]),
        );
      } else {
        conditions.push(
          eq(reservationTable.status, status as Reservation['status']),
        );
      }
    }

    const reservations = await db
      .select()
      .from(reservationTable)
      .where(and(...conditions))
      .orderBy(asc(reservationTable.reserveAt))
      .offset(offset)
      .limit(limit);

    return reservations;
  }

  static async cancelReservation(data: {
    reservationId: number;
    userId: number;
    cancelBy: 'user' | 'restaurant_owner';
  }): Promise<void> {
    const [reservation] = await db
      .select()
      .from(reservationTable)
      .where(eq(reservationTable.id, data.reservationId))
      .limit(1);
    if (!reservation) {
      throw new createHttpError.NotFound('Reservation not found');
    }

    await this.validateReservationOwnership(
      reservation,
      data.userId,
      data.cancelBy,
    );

    if (
      reservation.status !== 'unconfirmed' &&
      reservation.status !== 'confirmed'
    ) {
      throw new createHttpError.BadRequest(
        'Reservation status must be unconfirmed or confirmed to cancel',
      );
    }

    let [updated] = await db
      .update(reservationTable)
      .set({ status: 'cancelled' })
      .where(eq(reservationTable.id, reservation.id))
      .returning();

    await NotificationService.notifyReservationStatuses([
      {
        reservation: updated,
        target: data.cancelBy === 'user' ? 'restaurant_owner' : 'user',
      },
    ]);
  }

  static async createReservation(data: {
    userId: number;
    restaurantId: number;
    reserveAt: Date;
    numberOfAdult?: number;
    numberOfChildren?: number;
  }) {
    // check if user balance is sufficient (reservation fee is stored in restaurant table)
    const [restaurant] = await db
      .select()
      .from(restaurantTable)
      .where(eq(restaurantTable.id, data.restaurantId))
      .limit(1);

    const [user]  = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, data.userId))
      .limit(1);

    if (!restaurant) {
      throw new createHttpError.NotFound('Restaurant not found');
    }
    if (!user) {
      throw new createHttpError.NotFound('User not found');
    }
    if (user.balance < restaurant.reservationFee) {
      throw new createHttpError.BadRequest(
        'Insufficient balance to make a reservation',
      );
    }

    await db
      .update(usersTable)
      .set({ balance: user.balance - restaurant.reservationFee })
      .where(eq(usersTable.id, user.id));
      
    const [inserted] = await db
      .insert(reservationTable)
      .values({
        userId: data.userId,
        restaurantId: data.restaurantId,
        reserveAt: data.reserveAt,
        numberOfAdult: data.numberOfAdult ?? 0,
        numberOfChildren: data.numberOfChildren ?? 0,
        status: 'unconfirmed',
      })
      .returning();

    await NotificationService.notifyNewReservation(inserted);
    return inserted;
  }

  static async getReservationsByRestaurantIdInOneMonth(
    restaurantId: number,
    month: number,
    year: number,
  ): Promise<Reservation[]> {
    const reservations = await db
      .select()
      .from(reservationTable)
      .orderBy(reservationTable.reserveAt)
      .where(
        and(
          eq(reservationTable.restaurantId, restaurantId),
          gte(reservationTable.reserveAt, new Date(year, month - 1, 1)),
          lt(reservationTable.reserveAt, new Date(year, month, 1)),
        ),
      );

    return reservations;
  }

  static async validateReservationOwnership(
    reservation: Reservation,
    userId: number,
    verify_for: 'user' | 'restaurant_owner',
  ): Promise<void> {
    switch (verify_for) {
      case 'user':
        if (reservation.userId !== userId) {
          throw new createHttpError.Forbidden(
            'User is not authorized to cancel this reservation',
          );
        }
        break;
      case 'restaurant_owner':
        const [restaurant] = await db
          .select()
          .from(restaurantTable)
          .where(eq(restaurantTable.id, reservation.restaurantId))
          .limit(1);

        if (!restaurant || restaurant.ownerId !== userId) {
          throw new createHttpError.Forbidden(
            'Restaurant owner is not authorized to cancel this reservation',
          );
        }
        break;
      default:
        throw new createHttpError.InternalServerError(
          'verify_for must be either user or restaurant_owner',
        );
    }
  }

  static async updateReservationStatus(
    reservationId: number,
    userId: number,
    newStatus: Reservation['status'],
    updateBy: 'user' | 'restaurant_owner',
  ): Promise<Reservation> {
    // ensure reservation exists
    const [reservation] = await db
      .select()
      .from(reservationTable)
      .where(eq(reservationTable.id, reservationId))
      .limit(1);
    if (!reservation) {
      throw new createHttpError.NotFound('Reservation not found');
    }

    await this.validateReservationOwnership(reservation, userId, updateBy);

    const [updated] = await db
      .update(reservationTable)
      .set({ status: newStatus })
      .where(eq(reservationTable.id, reservationId))
      .returning();

    await NotificationService.notifyReservationStatuses([
      {
        reservation: updated,
        target: updateBy === 'user' ? 'restaurant_owner' : 'user',
      },
    ]);
    return updated;
  }

  // USER RESERVATION METHODS
  static async getReservationsByUser(props: {
    userId: number;
    status?: Reservation['status'] | Reservation['status'][];
    offset?: number;
    limit?: number;
  }): Promise<ReservationWithRestaurant[]> {
    const userId = props.userId;
    const status = props.status;
    const offset = props.offset ?? 0;
    const limit = props.limit ?? 50;

    const conditions: any[] = [eq(reservationTable.userId, userId)];

    if (status) {
      if (Array.isArray(status)) {
        conditions.push(
          inArray(reservationTable.status, status as Reservation['status'][]),
        );
      } else {
        conditions.push(
          eq(reservationTable.status, status as Reservation['status']),
        );
      }
    }

    const reservations = await db
      .select()
      .from(reservationTable)
      .leftJoin(
        restaurantTable,
        eq(reservationTable.restaurantId, restaurantTable.id),
      )
      .where(and(...conditions))
      .orderBy(desc(reservationTable.reserveAt))
      .offset(offset)
      .limit(limit);

    return reservations.map((row) => ({
      ...row.reservation,
      restaurant: row.restaurant!,
    }));
  }

  static async expireUnconfirmedReservations(
    expiryMinutes: number,
  ): Promise<number> {
    // Find and update all unconfirmed reservations that are older than expiryMinutes
    const result = await db
      .update(reservationTable)
      .set({ status: 'expired' })
      .where(
        and(
          eq(reservationTable.status, 'unconfirmed'),
          sql`${reservationTable.createdAt} < NOW() - INTERVAL '${sql.raw(
            expiryMinutes.toString(),
          )} minutes'`,
        ),
      )
      .returning();

    await NotificationService.notifyReservationStatuses(
      result.map((reservation) => {
        return { reservation, target: 'both' };
      }),
    );
    return result.length;
  }
}
