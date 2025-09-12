import {
  InferSelectModel,
  eq,
  and,
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

  static async cancleReservation(data: { reservationId: number; userId: number; restaurantId: number }): Promise<void> {
    let reservationId = data.reservationId;
    let userId = data.userId;
    let restarantId = data.restaurantId;
    let reservation = await db
      .select()
      .from(reservationTable)
      .where(
        
          eq(reservationTable.id, reservationId),
          
        
      );
    if (reservation.length === 0) {
      throw new Error('Reservation not found');
    }
    if ((new Date(reservation[0].reserveAt).getTime() - Date.now()) <= 24*60 * 60 * 1000) {
      throw new Error('Cannot cancel reservation within 24 hours');
    }
    if (reservation[0].status !== 'unconfirmed' && reservation[0].status !== 'confirmed') {
      throw new Error('Cannot cancel reservation that is not unconfirmed or confirmed');
    }
    await db
      .update(reservationTable)
      .set({ status: 'cancelled' })
      .where(eq(reservationTable.id, reservationId));
    
  }
}