import ApiService from '@/services/api.service';
import { Restaurant, RestaurantSchema } from '../types/restaurant.type';
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
