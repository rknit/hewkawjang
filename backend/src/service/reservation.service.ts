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
}