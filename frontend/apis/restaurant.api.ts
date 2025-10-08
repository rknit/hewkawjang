import ApiService from '@/services/api.service';
import {
  UpdateRestaurantInfo,
  Restaurant,
  RestaurantSchema,
} from '@/types/restaurant.type';
import { Reservation, ReservationSchema } from '@/types/reservation.type';
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

    const res = await ApiService.get(`/restaurants/${id}/reservations`, {
      params,
    });

    return res.data.map((r: any) => ReservationSchema.parse(r));
  } catch (error) {
    normalizeError(error);
    return null;
  }
}
