import { Restaurant } from '@/types/restaurant.type';
import { calculatePriceRange } from '@/utils/price-range';
import { getRestaurantTags, makeRestaurantAddress } from '@/utils/restaurant';
import { Feather } from '@expo/vector-icons';
import { Star } from 'lucide-react';
import { View, Text, TouchableOpacity } from 'react-native';
import ReserveButton from './reserve-button';

interface RestaurantReserveSummaryProps {
  restaurant: Restaurant | null;
  avgRating: number;
  isLoggedIn: boolean;
  onPressReport?: () => void;
  disableReserveButton?: boolean;
}

export default function RestaurantReserveSummary({
  restaurant,
  avgRating,
  isLoggedIn,
  onPressReport,
  disableReserveButton,
}: RestaurantReserveSummaryProps) {
  return (
    <View>
      {/* Restaurant Summary */}
      <View className="flex-col gap-y-2">
        <Text className="text-2xl font-bold text-gray-900">
          {restaurant?.name || 'Loading...'}
        </Text>

        <View className="flex-row max-w-[32rem]">
          {/* address */}
          <Text className="text-sm text-gray-600">
            {restaurant ? makeRestaurantAddress(restaurant) : 'Loading...'}
          </Text>

          {/* report button, only available when logged in */}
          {isLoggedIn && (
            <TouchableOpacity className="mt-0.5" onPress={onPressReport}>
              <Feather name="flag" size={16} color="#9C9C9C" />
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-row gap-x-6">
          {/* tags */}
          <View className="flex-row gap-x-4">
            {restaurant &&
              getRestaurantTags(restaurant).map((tag) => {
                return (
                  <Text key={tag} className="text-xs text-gray-600">
                    {tag}
                  </Text>
                );
              })}
          </View>

          {/* avg rating */}
          <View className="flex-row items-center">
            <Star size={16} color="gold" fill="gold" />
            <Text className="ml-1 text-gray-800 font-medium">
              {Number.isInteger(avgRating) ? `${avgRating}.0` : avgRating}
            </Text>
          </View>

          {/* Price Icons */}
          <View className="flex-row space-x-1">
            {Array.from({
              length: calculatePriceRange(restaurant?.priceRange ?? 0),
            }).map((_, idx) => (
              <View
                key={idx}
                className="w-5 h-5 bg-gray-100 rounded-full items-center justify-center border-black border-[1px]"
              >
                <Text className="text-xs">฿</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <ReserveButton
        restaurantId={restaurant?.id}
        disabled={disableReserveButton}
      />
    </View>
  );
}
