import {
  inArray,
  InferInsertModel,
  InferSelectModel,
  asc,
  eq,
} from 'drizzle-orm';
import { restaurantTable } from '../db/schema';
import { db } from '../db';
import createHttpError from 'http-errors';
import { createRestaurantSchema, CreateRestaurantInput } from "../validators/restaurant.validator";

export type Restaurant = InferSelectModel<typeof restaurantTable>;

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

  static async createRestaurant(data: CreateRestaurantInput) {
    // validate input (extra safety)
    const parsed = createRestaurantSchema.parse(data);

    const [restaurant] = await db
      .insert(restaurantTable)
      .values(parsed)
      .returning();

    return restaurant;
  }
}