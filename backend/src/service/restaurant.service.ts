import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  inArray,
  InferInsertModel,
  InferSelectModel,
  lte,
  or,
  sql,
} from 'drizzle-orm';
import { db } from '../db';
import {
  reservationTable,
  restaurantTable,
  reviewTable,
  usersTable,
} from '../db/schema';
import {
  CreateRestaurantInput,
  UpdateRestaurantInfo,
} from '../validators/restaurant.validator';
import createHttpError from 'http-errors';
import Fuse from 'fuse.js';

export type Restaurant = InferSelectModel<typeof restaurantTable>;
export type NewRestaurant = InferInsertModel<typeof restaurantTable>;
export type RestaurantStatus = NewRestaurant['status'];
export type RestaurantActivation = NewRestaurant['activation'];
export type Reservation = InferInsertModel<typeof reservationTable>;

export interface SearchParams {
  query?: string;
  province?: string;
  priceRange?: { min: number; max: number };
  cuisineTypes: string[];
  minRating: number;
  sortBy: { field: 'rating' | 'price' | 'name'; order: 'asc' | 'desc' };
  offset: number;
  limit: number;
}

export interface RestaurantWithAvgRating extends Restaurant {
  avgRating: number;
}

export interface RestaurantWithRating extends Restaurant {
  avgRating: number;
  reviewCount: number;
}

export interface SearchResult {
  restaurants: RestaurantWithRating[];
  total: number;
  hasMore: boolean;
}

export interface ReviewWithUser {
  id: number;
  rating: number;
  comment: string | null;
  attachPhotos: string[] | null;
  createdAt: Date;
  user: {
    id: number;
    displayName: string | null;
    firstName: string;
    lastName: string;
    profileUrl: string | null;
  };
}

export interface ReviewsResult {
  reviews: ReviewWithUser[];
  hasMore: boolean;
}

export default class RestaurantService {
  static async getRestaurants(
    props: {
      ids?: number[];
      offset?: number;
      limit?: number;
      sortOrder?: 'asc' | 'desc';
    } = {},
  ): Promise<Restaurant[]> {
    let query: any = db.select().from(restaurantTable);

    if (props.ids && props.ids.length > 0) {
      query = query.where(inArray(restaurantTable.id, props.ids));
    }

    if (props.sortOrder !== undefined) {
      const sortOrder = props.sortOrder === 'desc' ? desc : asc;
      query = query.orderBy(sortOrder(restaurantTable.id));
    }

    if (props.offset !== undefined) {
      query = query.offset(props.offset);
    }

    if (props.limit !== undefined) {
      query = query.limit(props.limit);
    }

    return await query;
  }

  static async getTopRatedRestaurants({
    limit,
    offset,
  }: {
    limit?: number;
    offset?: number;
  }): Promise<RestaurantWithAvgRating[]> {
    const avgRating = sql<number>`
      ROUND(
        COALESCE(AVG(${reviewTable.rating})::numeric, 0),
        1
      )::float
    `.as('avgRating');

    let query: any = db
      .select({
        ...getTableColumns(restaurantTable),
        avgRating,
      })
      .from(restaurantTable)
      .leftJoin(
        reservationTable,
        eq(restaurantTable.id, reservationTable.restaurantId),
      )
      .leftJoin(
        reviewTable,
        and(
          eq(reservationTable.id, reviewTable.reservationId),
          eq(reservationTable.status, 'completed'),
        ),
      )
      .groupBy(restaurantTable.id)
      .orderBy(desc(avgRating));

    if (offset !== undefined) {
      query = query.offset(offset);
    }

    if (limit !== undefined) {
      query = query.limit(limit);
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
  
  static async getPendingVerificationRestaurants(): Promise<Restaurant[]> {
    const pendingRestaurants = await db
      .select()
      .from(restaurantTable)
      .where(
        and(
          eq(restaurantTable.isVerified, false),
          eq(restaurantTable.isDeleted, false),
        ),
      );

    return pendingRestaurants;
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
        .set({ activation: newActivation })
        .where(eq(restaurantTable.id, restaurantId))
        .returning();

      if (!updatedRestaurant) {
        throw createHttpError(404, 'Restaurant not found');
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
              ),
            ),
          );
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

  static async deleteRestaurant(restaurantId: number): Promise<void> {
    const restaurant = await db
      .select()
      .from(restaurantTable)
      .where(eq(restaurantTable.id, restaurantId))
      .limit(1);
    if (!restaurant || restaurant.length === 0) {
      throw createHttpError.NotFound('Restaurant not found');
    }

    // Reject all future reservations in one query

    const reservations = await db
      .update(reservationTable)
      .set({ status: 'rejected' })
      .where(
        or(
          and(
            eq(reservationTable.restaurantId, restaurantId),
            gt(reservationTable.reserveAt, new Date()),
            eq(reservationTable.status, 'confirmed'),
          ),
          and(
            eq(reservationTable.restaurantId, restaurantId),
            gt(reservationTable.reserveAt, new Date()),
            eq(reservationTable.status, 'unconfirmed'),
          ),
        ),
      );

    const result = await db
      .update(restaurantTable)
      .set({ isDeleted: true })
      .where(eq(restaurantTable.id, restaurantId))
      .returning();
  }

  static async searchRestaurants(params: SearchParams): Promise<SearchResult> {
    const {
      query,
      province,
      priceRange,
      cuisineTypes,
      minRating,
      sortBy,
      offset,
      limit,
    } = params;

    const restaurantColumns = getTableColumns(restaurantTable);

    // Apply filters - build conditions
    const conditions = [
      eq(restaurantTable.activation, 'active'),
      eq(restaurantTable.isDeleted, false),
    ];

    if (province) {
      conditions.push(eq(restaurantTable.province, province));
    }

    // Price range filter
    if (priceRange) {
      if (priceRange.min !== undefined) {
        conditions.push(gte(restaurantTable.priceRange, priceRange.min));
      }
      if (priceRange.max !== undefined) {
        conditions.push(lte(restaurantTable.priceRange, priceRange.max));
      }
    }

    // Cuisine types filter
    if (cuisineTypes.length > 0) {
      conditions.push(
        inArray(restaurantTable.cuisineType, cuisineTypes as any),
      );
    }

    // Base query with rating calculation and all conditions applied
    const finalQuery = db
      .select({
        // All restaurant fields
        ...restaurantColumns,
        // Calculate average rating and review count
        avgRating: sql<number>`COALESCE(AVG(${reviewTable.rating}), 0)`,
        reviewCount: sql<number>`COUNT(${reviewTable.id})`,
      })
      .from(restaurantTable)
      .leftJoin(
        reservationTable,
        eq(restaurantTable.id, reservationTable.restaurantId),
      )
      .leftJoin(
        reviewTable,
        and(
          eq(reservationTable.id, reviewTable.reservationId),
          eq(reservationTable.status, 'completed'), // Only count reviews from completed reservations
        ),
      )
      .where(and(...conditions))
      .groupBy(restaurantTable.id);

    // Execute query to get filtered results (limit to 200 for performance)
    let allResults = await finalQuery.limit(200);

    // Apply fuzzy search
    if (query && query.trim().length > 0) {
      const fuseOptions = {
        keys: [
          { name: 'name', weight: 0.6 },
          { name: 'district', weight: 0.1 },
          { name: 'subDistrict', weight: 0.1 },
          { name: 'cuisineType', weight: 0.2 },
        ],
        threshold: 0.3,
        includeScore: true,
        ignoreLocation: true,
        findAllMatches: false,
        minMatchCharLength: 3,
        useExtendedSearch: false,
      };

      const fuse = new Fuse(allResults, fuseOptions);
      const fuseResults = fuse.search(query.trim());

      allResults = fuseResults.map((result) => result.item);
    }

    // Filter by minRating
    const ratingFilteredResults = allResults.filter(
      (r) => r.avgRating >= minRating,
    );

    // Sort Result
    const sortedResults = ratingFilteredResults.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortBy.field) {
        case 'rating':
          aValue = a.avgRating;
          bValue = b.avgRating;
          break;
        case 'price':
          aValue = a.priceRange || 0;
          bValue = b.priceRange || 0;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          aValue = a.avgRating;
          bValue = b.avgRating;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortBy.order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortBy.order === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    // Apply pagination
    const total = sortedResults.length;
    const paginatedResults = sortedResults.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      restaurants: paginatedResults,
      total,
      hasMore,
    };
  }

  static async getReviewsByRestaurantId(props: {
    restaurantId: number;
    offset?: number;
    limit?: number;
  }): Promise<ReviewsResult> {
    const { restaurantId, offset = 0, limit = 10 } = props;

    // Query reviews with user information
    const reviews = await db
      .select({
        id: reviewTable.id,
        rating: reviewTable.rating,
        comment: reviewTable.comment,
        attachPhotos: reviewTable.attachPhotos,
        createdAt: reviewTable.createdAt,
        userId: usersTable.id,
        userDisplayName: usersTable.displayName,
        userFirstName: usersTable.firstName,
        userLastName: usersTable.lastName,
        userProfileUrl: usersTable.profileUrl,
      })
      .from(reviewTable)
      .innerJoin(
        reservationTable,
        eq(reviewTable.reservationId, reservationTable.id),
      )
      .innerJoin(usersTable, eq(reservationTable.userId, usersTable.id))
      .where(
        and(
          eq(reservationTable.restaurantId, restaurantId),
          eq(reservationTable.status, 'completed'),
        ),
      )
      .orderBy(desc(reviewTable.createdAt))
      .limit(limit + 1) // Fetch one extra to determine hasMore
      .offset(offset);

    // Check if there are more results
    const hasMore = reviews.length > limit;
    const reviewsToReturn = hasMore ? reviews.slice(0, limit) : reviews;

    // Transform the results to match the interface
    const transformedReviews: ReviewWithUser[] = reviewsToReturn.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      attachPhotos: r.attachPhotos,
      createdAt: r.createdAt,
      user: {
        id: r.userId,
        displayName: r.userDisplayName,
        firstName: r.userFirstName,
        lastName: r.userLastName,
        profileUrl: r.userProfileUrl,
      },
    }));

    return {
      reviews: transformedReviews,
      hasMore,
    };
  }

  static async getFilteredReviews(
    restaurantId: number,
    minRating?: number,
    maxRating?: number,
  ) {
    // Base conditions
    const conditions = [
      eq(reservationTable.restaurantId, restaurantId),
      eq(reservationTable.status, 'completed'),
    ];

    if (minRating !== undefined) {
      conditions.push(gte(reviewTable.rating, minRating));
    }

    if (maxRating !== undefined) {
      conditions.push(lte(reviewTable.rating, maxRating));
    }

    const reviews = await db
      .select({
        id: reviewTable.id,
        rating: reviewTable.rating,
        comment: reviewTable.comment,
        attachPhotos: reviewTable.attachPhotos,
        createdAt: reviewTable.createdAt,
        userId: usersTable.id,
        userDisplayName: usersTable.displayName,
        userFirstName: usersTable.firstName,
        userLastName: usersTable.lastName,
        userProfileUrl: usersTable.profileUrl,
      })
      .from(reviewTable)
      .innerJoin(
        reservationTable,
        eq(reviewTable.reservationId, reservationTable.id),
      )
      .innerJoin(usersTable, eq(reservationTable.userId, usersTable.id))
      .where(and(...conditions)) // <-- all conditions combined here
      .orderBy(desc(reviewTable.createdAt));

    const transformedReviews: ReviewWithUser[] = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      attachPhotos: r.attachPhotos,
      createdAt: r.createdAt,
      user: {
        id: r.userId,
        displayName: r.userDisplayName,
        firstName: r.userFirstName,
        lastName: r.userLastName,
        profileUrl: r.userProfileUrl,
      },
    }));

    return {
      reviews: transformedReviews,
      hasMore: false,
    };
  }
}
