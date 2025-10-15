import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { searchRestaurants } from '@/apis/restaurant.api';
import RestaurantList from '@/components/restaurantList';
import SearchPanel from '@/components/search-panel';
import type { RestaurantWithRating } from '@/types/restaurant.type';

export default function SearchResults() {
  const [restaurants, setRestaurants] = useState<RestaurantWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data } = useLocalSearchParams();

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        
        // Decode search parameters
        const searchParams = data ? JSON.parse(atob(data as string)) : null;
        
        if (!searchParams) {
          setError('No search parameters provided');
          return;
        }

        // console.log('Search params:', searchParams);
        
        const results = await searchRestaurants(searchParams);

        setRestaurants(results.restaurants);
        setError(null);
      } catch (err) {
        setError('Failed to load search results');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (data) {
      fetchSearchResults();
    }
  }, [data]);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 gap-4 w-full">
        <View className="pt-14 w-full justify-center items-center gap-4">
          <Text className="right-40 text-4xl text-[#E05910]">HEW KAW JANG</Text>
          <Text className="left-10 text-xl">
            From Hunger to Happiness — One Reservation Away.
          </Text>
        </View>
        <View className="w-full gap-8 justify-center items-center -top-32">
          <View className="w-full justify-center items-center">
            <Image
              source={require('@/assets/images/hewman.png')}
              className="-bottom-8 -left-1/4 w-full h-full max-w-md aspect-square"
              resizeMode="contain"
            />
            <SearchPanel />
          </View>
      {/* //   Restaurant List */}
         <RestaurantList 
        restaurants={restaurants}
        loading={loading}
        error={error}
      />
        </View>
      </View>
    </ScrollView>
  );
}