import {
  InferSelectModel,
  eq,
  and,
  inArray,
} from 'drizzle-orm';
import { reservationTable } from '../db/schema';
import { db } from '../db';

export type Reservation = InferSelectModel<typeof reservationTable>;

export default class ReservationService {
  static async getUnconfirmedReservationsByRestaurant(
    props: { restaurantId: number; offset?: number; },
  ): Promise<Reservation[]> {
    let restaurantId = props.restaurantId;
    let offset = props.offset ?? 0;
    
    let reservations = await db
      .select()
      .from(reservationTable)
      .where(
        and(
          eq(reservationTable.restaurantId, restaurantId),
          eq(reservationTable.status, 'unconfirmed')
        )
      )
      .offset(offset);

    return reservations;
  }

  // I create a dummy for this function for now, since I'm not sure how Bank and Muntow would handle the refund fees
  static async cancelPendingReservationsByUser(userId: number){
    // Find all unconfirmed reservations
    const reservations = await db
      .select()
      .from(reservationTable)
      .where(
        and(
          eq(reservationTable.userId, userId),
          eq(reservationTable.status, 'unconfirmed')
        )
      );

    if(reservations.length === 0) return [];

    // Update their status to 'cancelled'
    const reservationIds = reservations.map(r => r.id);
    await db
      .update(reservationTable)
      .set({ status: 'cancelled' })
      .where(inArray(reservationTable.id, reservationIds));

    // Return the cancelled reservations
    const fees = reservations.map(r => ({
      reservationId: r.id,
      refundFee: Math.floor((r.reservationfee || 0) * 0.05),
    }))

    return fees;
  }
}