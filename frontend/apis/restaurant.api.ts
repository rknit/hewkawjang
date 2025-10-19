import ApiService from '@/services/api.service';
import { Reservation, ReservationSchema } from '@/types/reservation.type';
import {
  Restaurant,
  RestaurantSchema,
  RestaurantWithRating,
  UpdateRestaurantInfo,
} from '@/types/restaurant.type';
import {
  Comment,
  ReviewsResultSchema,
  ReviewWithUser,
} from '@/types/review.type';
import { normalizeError } from '@/utils/api-error';
import { getRelativeTime } from '@/utils/date-time';

export async function fetchRestaurants(): Promise<Restaurant[]> {
  try {
    const res = await ApiService.get('/restaurants/');
    return res.data.map((restaurant: any) =>
      RestaurantSchema.parse(restaurant),
    );
  } catch (error) {
    console.error('Failed to fetch restaurants:', error);
    return [];
  }
}

export async function fetchRestaurantById(
  id: number,
): Promise<Restaurant | null> {
  try {
    const restaurants = await fetchRestaurants();
    return restaurants.find((restaurant) => restaurant.id === id) || null;
  } catch (error) {
    console.error('Failed to fetch restaurant by ID:', error);
    return null;
  }
}

export async function updateRestaurantInfo(
  data: UpdateRestaurantInfo,
): Promise<void> {
  try {
    await ApiService.put('/restaurants', data);
  } catch (error) {
    normalizeError(error);
  }
}

export async function setRestaurantActivation(
  id: number,
  status: 'active' | 'inactive',
): Promise<void> {
  try {
    await ApiService.patch(`/restaurants/${id}/activation`, { status });
  } catch (error) {
    normalizeError(error);
  }
}

export async function updateRestaurantStatus(
  id: number,
  status: 'open' | 'closed',
): Promise<void> {
  try {
    await ApiService.put('/restaurants/update/status', {
      id: id,
      status: status,
    });
  } catch (error) {
    normalizeError(error);
  }
}

// Owner-facing: fetch reservations for a restaurant (owner must be authenticated)
export async function fetchReservationsForOwner(
  id: number,
  options?: { status?: string | string[]; offset?: number; limit?: number },
): Promise<Reservation[] | null> {
  try {
    const params: any = {};
    if (options?.offset !== undefined) params.offset = options.offset;
    if (options?.limit !== undefined) params.limit = options.limit;
    if (options?.status !== undefined) {
      params.status = Array.isArray(options.status)
        ? options.status.join(',')
        : options.status;
    }

    const res = await ApiService.get(`/restaurants/${id}/my-reservations`, {
      params,
    });

    return res.data.map((r: any) => ReservationSchema.parse(r));
  } catch (error) {
    normalizeError(error);
    return null;
  }
}

// Public-facing: fetch reservations for a restaurant (supports status, offset, limit)
export async function fetchReservationsByRestaurant(
  restaurantId: number,
  options?: { status?: string | string[]; offset?: number; limit?: number },
): Promise<Reservation[] | null> {
  try {
    const params: any = {};

    if (options?.offset !== undefined) params.offset = options.offset;
    if (options?.limit !== undefined) params.limit = options.limit;
    if (options?.status !== undefined) {
      params.status = Array.isArray(options.status)
        ? options.status.join(',')
        : options.status;
    }

    const res = await ApiService.get(
      `/restaurants/${restaurantId}/reservations`,
      {
        params,
      },
    );

    return res.data.map((r: any) => ReservationSchema.parse(r));
  } catch (error) {
    normalizeError(error);
    return null;
  }
}

export async function searchRestaurants(params: {
  query?: string;
  province?: string;
  priceRange?: { min: number; max: number };
  cuisineTypes: string[];
  minRating: number;
  sortBy: { field: 'rating' | 'price' | 'name'; order: 'asc' | 'desc' };
  offset: number;
  limit: number;
}): Promise<{
  restaurants: RestaurantWithRating[];
  total: number;
  hasMore: boolean;
}> {
  try {
    // Prepare the request body to match the backend service
    const requestBody = {
      query: params.query || '',
      province: params.province || '',
      priceRange: params.priceRange,
      cuisineTypes: params.cuisineTypes,
      minRating: params.minRating,
      sortBy: params.sortBy,
      offset: params.offset,
      limit: params.limit,
    };

    // console.log('Search request:', requestBody);

    const res = await ApiService.post('/restaurants/search', requestBody);

    // Parse and validate the response data
    const restaurants = res.data.restaurants.map(
      (restaurant: RestaurantWithRating) => ({
        ...RestaurantSchema.parse({
          id: restaurant.id,
          ownerId: restaurant.ownerId,
          name: restaurant.name,
          phoneNo: restaurant.phoneNo,
          // address
          houseNo: restaurant.houseNo,
          village: restaurant.village,
          building: restaurant.building,
          road: restaurant.road,
          soi: restaurant.soi,
          subDistrict: restaurant.subDistrict,
          district: restaurant.district,
          province: restaurant.province,
          postalCode: restaurant.postalCode,
          // detail
          cuisineType: restaurant.cuisineType,
          priceRange: restaurant.priceRange,
          status: restaurant.status,
          activation: restaurant.activation,
          isDeleted: restaurant.isDeleted,
        }),
        // Add the rating fields
        avgRating: restaurant.avgRating || 0,
        reviewCount: restaurant.reviewCount || 0,
      }),
    );

    return {
      restaurants,
      total: res.data.total,
      hasMore: res.data.hasMore,
    };
  } catch (error) {
    normalizeError(error);

    // Return empty results on error
    return {
      restaurants: [],
      total: 0,
      hasMore: false,
    };
  }
}

// Fetch all reviews for a restaurant
export async function fetchReviewsByRestaurantId(
  restaurantId: number,
  options?: { offset?: number; limit?: number },
): Promise<{
  reviews: Comment[];
  avgRating: number;
  breakdown: { 5: number; 4: number; 3: number; 2: number; 1: number };
}> {
  try {
    const params: any = {};

    // Fetch all reviews by default (high limit)
    if (options?.offset !== undefined) params.offset = options.offset;
    if (options?.limit !== undefined) {
      params.limit = options.limit;
    } else {
      params.limit = 1000; // Fetch up to 1000 reviews by default
    }

    const res = await ApiService.get(`/restaurants/${restaurantId}/reviews`, {
      params,
    });

    // Validate response
    const result = ReviewsResultSchema.parse(res.data);

    // Transform to Comment format for UI
    const comments: Comment[] = result.reviews.map((review: ReviewWithUser) => {
      // Use displayName if available, otherwise use firstName only
      const name = review.user.displayName || review.user.firstName;

      return {
        id: review.id.toString(),
        name: name,
        avatar: review.user.profileUrl || '', // Empty string will be handled by component
        rating: review.rating,
        comment: review.comment || 'No comment provided',
        date: getRelativeTime(new Date(review.createdAt)),
      };
    });

    // Calculate average rating
    const avgRating =
      comments.length > 0
        ? comments.reduce((sum, c) => sum + c.rating, 0) / comments.length
        : 0;

    // Calculate breakdown (count of each rating 1-5)
    const breakdown: { 5: number; 4: number; 3: number; 2: number; 1: number } =
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    comments.forEach((comment) => {
      if (comment.rating >= 1 && comment.rating <= 5) {
        breakdown[comment.rating as 1 | 2 | 3 | 4 | 5]++;
      }
    });

    return {
      reviews: comments,
      avgRating,
      breakdown,
    };
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    normalizeError(error);

    // Return empty results on error
    return {
      reviews: [],
      avgRating: 0,
      breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
}

// Fetch filtered reviews for a restaurant
export async function fetchFilteredReviews(
  restaurantId: number,
  options?: {
    minRating?: number;
    maxRating?: number;
    offset?: number;
    limit?: number;
  },
): Promise<{ reviews: Comment[]; hasMore: boolean }> {
  try {
    const params: any = {};
    if (options?.minRating !== undefined) params.minRating = options.minRating;
    if (options?.maxRating !== undefined) params.maxRating = options.maxRating;
    if (options?.offset !== undefined) params.offset = options.offset;
    if (options?.limit !== undefined) params.limit = options.limit;

    const res = await ApiService.get(
      `/restaurants/${restaurantId}/reviews/filter`,
      { params },
    );

    // Transform to Comment format (like fetchReviewsByRestaurantId)
    const comments: Comment[] = res.data.reviews.map(
      (review: ReviewWithUser) => {
        const name = review.user.displayName || review.user.firstName;
        return {
          id: review.id.toString(),
          name: name,
          avatar: review.user.profileUrl || '',
          rating: review.rating,
          comment: review.comment || 'No comment provided',
          date: getRelativeTime(new Date(review.createdAt)),
        };
      },
    );

    return { reviews: comments, hasMore: res.data.hasMore };
  } catch (error) {
    console.error('Failed to fetch filtered reviews:', error);
    normalizeError(error);
    return { reviews: [], hasMore: false };
  }
}

export async function deleteRestaurant(restaurantId: number): Promise<void> {
  try {
    await ApiService.delete(`/restaurant/${restaurantId}`);
  } catch (error) {
    normalizeError(error);
  }
}
