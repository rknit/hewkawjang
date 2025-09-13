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
import { createRestaurantSchema, CreateRestaurantInput } from "../validators/restaurant.validator";

export type Restaurant = InferSelectModel<typeof restaurantTable>;
export type NewRestaurant = InferInsertModel<typeof restaurantTable>;
export type RestaurantStatus = NewRestaurant["status"];
export type RestaurantActivation = NewRestaurant["activation"];
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
  
  static async getRestaurantById(id: number): Promise<Restaurant | undefined> {
    const rows = await db
      .select()
      .from(restaurantTable)
      .where(eq(restaurantTable.id, id))
      .limit(1);

    return rows[0];
  }

  static async createRestaurant(data: CreateRestaurantInput) {
    const [restaurant] = await db
      .insert(restaurantTable)
      .values(data as InferInsertModel<typeof restaurantTable>)
      .returning();

    return restaurant;
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

  static async updateRestaurantActivation(
    restaurantId: number,
    newActivation: RestaurantActivation,
  ) {
    const [updated] = await db
      .update(restaurantTable)
      .set({ activation: newActivation })
      .where(eq(restaurantTable.id, restaurantId))
      .returning();

    if (!updated) {
      throw createHttpError(404, "Restaurant not found");
    }

    return updated;
  }

  static async deactivateRestaurant(restaurantId: number) {
    return await db.transaction(async (tx) => {
      const [updatedRestaurant] = await tx
        .update(restaurantTable)
        .set({ activation: 'inactive' })
        .where(eq(restaurantTable.id, restaurantId))
        .returning();

      if (!updatedRestaurant) {
        throw createHttpError(404, "Restaurant not found");
      }

      // Cancel all reservations in one query
      await tx
        .update(reservationTable)
        .set({ status: 'cancelled' })
        .where(eq(reservationTable.restaurantId, restaurantId));

      return updatedRestaurant;
    });
  }


}