import {
  inArray,
  InferInsertModel,
  InferSelectModel,
  asc,
  eq,
} from 'drizzle-orm';
import { restaurantTable, reservationTable, restaurantStatusEnum} from '../db/schema';
import { db } from '../db';
import createHttpError from 'http-errors';

export type Restaurant = InferSelectModel<typeof restaurantTable>;
export type NewRestaurant = InferInsertModel<typeof restaurantTable>;
export type RestaurantStatus = NewRestaurant["status"];
export type Reservation = InferInsertModel<typeof reservationTable>;

export default class RestaurantService {
  static async getRestaurants(
    props: { ids?: number[]; offset?: number; limit?: number } = {},
  ): Promise<Restaurant[]> {
    let offset = props.offset ?? 0;
    let limit = props.limit ?? 10;

    let query = db
      .select()
      .from(restaurantTable)
      .orderBy(asc(restaurantTable.id))
      .offset(offset)
      .limit(limit);

    if (props.ids && props.ids.length > 0) {
      return await query.where(inArray(restaurantTable.id, props.ids));
    }
    return await query;
  }

  static async getRestaurantsByOwner(
    props: { ownerId: number; offset?: number; limit?: number },
  ): Promise<Restaurant[]> {
    let ownerId = props.ownerId;
    let offset = props.offset ?? 0;
    let limit = props.limit ?? 10;

    let query = db
      .select()
      .from(restaurantTable)
      .where(eq(restaurantTable.ownerId, ownerId))
      .orderBy(asc(restaurantTable.id))
      .offset(offset)
      .limit(limit);

    return await query;
  }

  static async rejectReservation(reservationId: number): Promise<void> {
    await db
      .update(reservationTable)
      .set({status: 'rejected'})
      .where(eq(reservationTable.id, reservationId))
  }

  static async updateRestaurantStatus(restaurantId: number, newStatus: RestaurantStatus): Promise<void> {
    await db
      .update(restaurantTable)
      .set({status: newStatus})
      .where(eq(restaurantTable.id, restaurantId))
  }
}