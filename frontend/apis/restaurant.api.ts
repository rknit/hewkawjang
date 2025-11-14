import ApiService from '@/services/api.service';
import { Reservation, ReservationSchema } from '@/types/reservation.type';
import {
  DaysOffSchema,
  Restaurant,
  RestaurantSchema,
  RestaurantWithAvgRating,
  RestaurantWithAvgRatingSchema,
  RestaurantWithRating,
  UpdateRestaurantInfo,
  RestaurantHours,
  RestaurantHoursSchema,
  DaysOff,
  CreateRestaurant
} from '@/types/restaurant.type';
import {
  Comment,
  ReviewsResultSchema,
  ReviewsWithBreakdown,
  ReviewWithUser,
} from '@/types/review.type';
import { normalizeError } from '@/utils/api-error';
import { getRelativeTime } from '@/utils/date-time';

export async function fetchRestaurants(
  restaurantIds?: number[],
): Promise<Restaurant[]> {
  try {
    // If explicitly passed an empty array, return empty results
    if (restaurantIds !== undefined && restaurantIds.length === 0) {
      return [];
    }

    const params: any = {};
    if (restaurantIds !== undefined) {
      params.ids = restaurantIds.join(',');
    }

    const res = await ApiService.get('/restaurants', {
      params,
    });
    return res.data.map((restaurant: any) =>
      RestaurantSchema.parse(restaurant),
    );
  } catch (error) {
    console.error('Failed to fetch restaurants:', error);
    return [];
  }
}

export async function fetchTopRatedRestaurants({
  limit,
  offset,
}: {
  limit?: number;
  offset?: number;
} = {}): Promise<RestaurantWithAvgRating[]> {
  try {
    const params: any = {};
    if (limit !== undefined) params.limit = limit;
    if (offset !== undefined) params.offset = offset;

    const res = await ApiService.get('/restaurants/top-rated', {
      params,
    });

    return res.data.map((restaurant: any) =>
      RestaurantWithAvgRatingSchema.parse(restaurant),
    );
  } catch (error) {
    normalizeError(error);
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

export async function updateRestaurantVerification(
  restaurantId: number,
  action: boolean,
): Promise<void> {
  try {
    await ApiService.post(
      `/admins/restaurants/${restaurantId}/verify`,
      {
        action,
      },
    );
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
): Promise<Reservation[]> {
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
    return [];
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
          wallet: restaurant.wallet,
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
          isVerified: restaurant.isVerified,
          isDeleted: restaurant.isDeleted,
          images: restaurant.images,
          reservationFee: restaurant.reservationFee
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
): Promise<ReviewsWithBreakdown> {
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
        attachPhotos: review.attachPhotos || [],
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
      avgRating: Math.round((avgRating + Number.EPSILON) * 10) / 10,
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
          attachPhotos: review.attachPhotos || [],
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

export async function fetchOwnerRestaurants(
  userId: number,
  offset?: number,
  limit?: number,
): Promise<Restaurant[]> {
  try {
    const res = await ApiService.get(`/restaurants/owner/${userId}`, {
      params: { offset, limit },
    });
    return res.data.map((restaurant: any) =>
      RestaurantSchema.parse(restaurant),
    );
  } catch (error) {
    console.error('Failed to fetch owner restaurants:', error);
    return [];
  }
}

// Fetch days off for a restaurant as an array of date strings
export async function fecthDaysOff(
  restaurantId: number,
): Promise<string[]> {
  try {
    const res = await ApiService.get(
      `/restaurants/${restaurantId}/daysOff`,
    );
     return res.data.daysOff.map((dayOff: any) => DaysOffSchema.parse(dayOff).date);
  } catch (error) {
    console.error('Failed to fetch days off:', error);
    return [];
  }
}

export async function addDaysOff(
  restaurantId: number,
  dates: Date[],
): Promise<void> {
  try {
    await ApiService.post(`/restaurants/${restaurantId}/createDaysOff`, {
      dates,
    });
  } catch (error) {
    normalizeError(error);
  }
}

export async function removeDaysOff(
  restaurantId: number,
  dates: Date[],
): Promise<void> {
  try {
    await ApiService.post(`/restaurants/${restaurantId}/removeDaysOff`, {
      dates,
    });
  } catch (error) {
    normalizeError(error);
  }
}

// update daysoff
export async function updateDaysOff(
  restaurantId: number,
  dates: string[],
): Promise<void> {
  try {
    await ApiService.put(`/restaurants/${restaurantId}/updateDaysOff`, {
      dates,
    });
  } catch (error) {
    normalizeError(error);
  }
}

export async function getrestaurantHours(
  restaurantId: number,
): Promise<RestaurantHours[]> {
  try {
    const res = await ApiService.get(
      `/restaurants/${restaurantId}/hours`,
    );
    return res.data.map((hours: any) => RestaurantHoursSchema.parse(hours));
  } catch (error) {
    console.error('Failed to fetch restaurant hours:', error);
    return [];
  }
}

export async function updateRestaurantHours(
  restaurantId: number,
  hours: RestaurantHours[],
): Promise<void> {
  try {
    await ApiService.put(`/restaurants/${restaurantId}/hours`, hours);
  } catch (error) {
    normalizeError(error);
  }
}

// create restaurant
export async function createRestaurant(
  data: CreateRestaurant,
): Promise<number> {
  try {
    const res = await ApiService.post('/restaurants', data);
    return res.data.id; // Return the newly created restaurant ID
  }
  catch (error) {
    normalizeError(error);
    return -1; // Indicate failure
  }
}