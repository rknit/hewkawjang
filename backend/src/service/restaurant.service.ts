import {
  inArray,
  InferInsertModel,
  InferSelectModel,
  asc,
  eq,
  and,
  or,
} from 'drizzle-orm';
import { restaurantTable, reservationTable, restaurantHoursTable } from '../db/schema';
import { db } from '../db';
import {
  CreateRestaurantInput,
  UpdateRestaurantInfo,
} from '../validators/restaurant.validator';
import createHttpError from 'http-errors';

export type Restaurant = InferSelectModel<typeof restaurantTable>;
export type NewRestaurant = InferInsertModel<typeof restaurantTable>;
export type RestaurantHour = InferSelectModel<typeof restaurantHoursTable>;
export type NewRestaurantHour = InferInsertModel<typeof restaurantHoursTable>;
export type RestaurantStatus = NewRestaurant['status'];
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

  static async getRestaurantsByOwner(props: {
    ownerId: number;
    offset?: number;
    limit?: number;
  }): Promise<Restaurant[]> {
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

  static async getRestaurantOpeningHours(restaurantId: number): Promise<RestaurantHour[]> {
    const hours = await db
      .select({
        id: restaurantHoursTable.id,
        restaurantId: restaurantHoursTable.restaurantId,
        dayOfWeek: restaurantHoursTable.dayOfWeek,
        openTime: restaurantHoursTable.openTime,
        closeTime: restaurantHoursTable.closeTime,
        isClosed: restaurantHoursTable.isClosed, // optional if you have isClosed
      })
      .from(restaurantHoursTable)
      .where(eq(restaurantHoursTable.restaurantId, restaurantId))
      .orderBy(asc(restaurantHoursTable.dayOfWeek));

    return hours;
  }

  static async createRestaurant(data: NewRestaurant) {
    const [restaurant] = await db
      .insert(restaurantTable)
      .values(data as InferInsertModel<typeof restaurantTable>)
      .returning();

    return restaurant;
  }

  static async addOpeningHours(hours: NewRestaurantHour[]) {
    await db
      .insert(restaurantHoursTable)
      .values(hours)
      .onConflictDoNothing();
  }

  static async rejectReservation(reservationId: number): Promise<void> {
    await db
      .update(reservationTable)
      .set({ status: 'rejected' })
      .where(eq(reservationTable.id, reservationId));
  }

  static async updateRestaurantStatus(
    restaurantId: number,
    newStatus: RestaurantStatus,
  ): Promise<void> {
    await db
      .update(restaurantTable)
      .set({ status: newStatus })
      .where(eq(restaurantTable.id, restaurantId));
  }

  static async updateRestaurantActivation(
    restaurantId: number,
    newActivation: RestaurantActivation,
  ) {
    return await db.transaction(async (tx) => {
      const [updatedRestaurant] = await tx
        .update(restaurantTable)
        .set({ activation: newActivation})
        .where(eq(restaurantTable.id, restaurantId))
        .returning();

      if (!updatedRestaurant) {
        throw createHttpError(404, "Restaurant not found");
      }

      if (newActivation == 'inactive') {
        // Cancel all reservations in one query
        await tx
          .update(reservationTable)
          .set({ status: 'cancelled' })
          .where(
            and(
              eq(reservationTable.restaurantId, restaurantId),
              or(
                eq(reservationTable.status, 'confirmed'),
                eq(reservationTable.status, 'unconfirmed'),
              )
          ));
      }

      return updatedRestaurant;
    });
  }

  static async updateInfo(data: UpdateRestaurantInfo): Promise<Restaurant> {
    const [updatedRestaurant] = await db
      .update(restaurantTable)
      .set(data)
      .where(
        and(
          eq(restaurantTable.id, data.id),
          eq(restaurantTable.ownerId, data.ownerId!),
        ),
      )
      .returning();

    if (!updatedRestaurant) {
      throw createHttpError.NotFound(
        'Restaurant not found or not owned by user',
      );
    }

    return updatedRestaurant;
  }
}
