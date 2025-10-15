import ApiService from '@/services/api.service';
import { Reservation, ReservationSchema } from '@/types/reservation.type';
import {
  Restaurant,
  RestaurantSchema,
  UpdateRestaurantInfo,
  RestaurantWithRating,
} from '@/types/restaurant.type';
import { normalizeError } from '@/utils/api-error';

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
    const restaurants = res.data.restaurants.map((restaurant: RestaurantWithRating) => ({
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
    }));

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