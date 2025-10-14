import { InferSelectModel, eq, and, inArray, asc, gte, lt } from 'drizzle-orm';
import { reservationTable } from '../db/schema';
import { db } from '../db';
import createHttpError from 'http-errors';

export type Reservation = InferSelectModel<typeof reservationTable>;

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
  }): Promise<void> {
    let reservationId = data.reservationId;

    let reservation = await db
      .select()
      .from(reservationTable)
      .where(eq(reservationTable.restaurantId, reservationId));

    if (!reservation || reservation.length === 0) {
      throw new createHttpError.NotFound('Reservation not found');
    }
    if (
      new Date(reservation[0].reserveAt).getTime() - Date.now() <=
      24 * 60 * 60 * 1000
    ) {
      throw new createHttpError.BadRequest(
        'Cannot cancel reservation within 24 hours',
      );
    }
    if (
      reservation[0].status !== 'unconfirmed' &&
      reservation[0].status !== 'confirmed'
    ) {
      throw new createHttpError.BadRequest(
        'Reservation status must be unconfirmed or confirmed to cancel',
      );
    }
    await db
      .update(reservationTable)
      .set({ status: 'cancelled' })
      .where(eq(reservationTable.id, reservationId));
  }

  static async createReservation(data: {
    userId: number;
    restaurantId: number;
    reserveAt: Date;
    numberOfAdult?: number;
    numberOfChildren?: number;
  }) {
    const inserted = await db
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

    return inserted[0];
  }

  static async getReservationsByRestaurantIdInOneMonth(
    restarantId: number,
    month: number,
    year: number,
  ): Promise<Reservation[]> {
    const reservations = await db
      .select()
      .from(reservationTable)
      .orderBy(reservationTable.reserveAt)
      .where(
        and(
          eq(reservationTable.restaurantId, restarantId),
          gte(reservationTable.reserveAt, new Date(year, month, 1)),
          lt(reservationTable.reserveAt, new Date(year, month + 1, 1)),
        ),
      );

    return reservations;
  }

  static async updateReservationStatus(
    reservationId: number,
    newStatus: Reservation['status'],
  ): Promise<void> {
    // ensure reservation exists
    const rows = await db
      .select()
      .from(reservationTable)
      .where(eq(reservationTable.id, reservationId))
      .limit(1);

    if (!rows || rows.length === 0) {
      throw new createHttpError.NotFound('Reservation not found');
    }

    await db
      .update(reservationTable)
      .set({ status: newStatus })
      .where(eq(reservationTable.id, reservationId));
  }
}
