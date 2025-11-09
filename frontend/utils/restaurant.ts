import { Restaurant } from '@/types/restaurant.type';

export function makeRestaurantAddress(restaurant: Restaurant): string {
  const parts = [
    restaurant.houseNo,
    restaurant.village,
    restaurant.building,
    restaurant.road,
    restaurant.soi,
    restaurant.subDistrict,
    restaurant.district,
    restaurant.province,
    restaurant.postalCode,
  ].filter((part) => part && part.trim() !== '');
  return parts.join(', ');
}
