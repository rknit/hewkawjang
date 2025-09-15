import ApiService from '@/services/api.service';
import {
  UpdateRestaurantInfo,
  Restaurant,
  RestaurantSchema,
  OpeningHour
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
    const res = await ApiService.get(`/restaurants/${id}`);
    return res.data as Restaurant;
  } catch (error) {
    console.error('Failed to fetch restaurant by ID:', error);
    return null;
  }
}

export async function fetchRestaurantOpeningHours(id: number): Promise<OpeningHour[]> {
  try {
    const res = await ApiService.get(`/restaurants/${id}/openingHours`);
    const data = res.data as OpeningHour[];

    // Map API data to frontend format
    return data.map((h) => ({
      id: h.id,
      restaurantId: h.restaurantId,
      dayOfWeek: h.dayOfWeek, // rename directly
      openTime: h.openTime,
      closeTime: h.closeTime,
      isClosed: h.isClosed ?? false, // optional, default false
    }));
  } catch (error) {
    console.error('Failed to fetch opening hours:', error);
    return [];
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
    await ApiService.put('/restaurants/update/status', { id: id, status: status });
  } catch (error) {
    normalizeError(error);
  }
}