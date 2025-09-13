import ApiService from '@/services/api.service';
import { UpdateRestaurantInfo } from '@/types/restaurant.type';
import { normalizeError } from '@/utils/api-error';

export async function updateRestaurantInfo(
  data: UpdateRestaurantInfo,
): Promise<void> {
  try {
    await ApiService.put('/restaurants', data);
  } catch (error) {
    normalizeError(error);
  }
}
