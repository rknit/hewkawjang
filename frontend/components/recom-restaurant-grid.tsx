import { fetchTopRatedRestaurants } from '@/apis/restaurant.api';
import RecommendedRestaurantCard from '@/components/recom-restaurant-card';
import { RestaurantWithAvgRating } from '@/types/restaurant.type';
import { calculatePriceRange } from '@/utils/price-range';
import { makeRestaurantAddress } from '@/utils/restaurant';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function RecommendedRestaurantGrid() {
  const [isLoading, setIsLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<RestaurantWithAvgRating[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchTopRatedRestaurants().then((data) => setRestaurants(data));
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return <ActivityIndicator size="large" color="#C54D0E" />;
  }

  return (
    <View className="p-4 w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
      {restaurants.map((restaurant) => {
        const fallbackImage =
          'https://uhrpfnyjcvpwoaioviih.supabase.co/storage/v1/object/public/test/photo-1517248135467-4c7edcad34c4.jpg';

        const tags = restaurant.district
          ? [restaurant.cuisineType, restaurant.district]
          : [restaurant.cuisineType];

        return (
          <RecommendedRestaurantCard
            key={restaurant.id}
            id={restaurant.id}
            name={restaurant.name}
            address={makeRestaurantAddress(restaurant)}
            tags={tags}
            rating={restaurant.avgRating}
            prices={calculatePriceRange(restaurant.priceRange ?? 0)}
            imageUrl={restaurant.images?.[0] ?? fallbackImage}
          />
        );
      })}
    </View>
  );
}
