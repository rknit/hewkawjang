import {
  fetchOwnerRestaurants,
  fetchReservationsByRestaurant,
  fetchReviewsByRestaurantId,
} from '@/apis/restaurant.api';
import MyRestaurantCard from '@/components/my_restaurant/myRestaurantCard';
import { useAuth } from '@/context/AuthContext';
import { Restaurant } from '@/types/restaurant.type';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';

export type MyRestaurantEntry = {
  restaurant: Restaurant;
  reservationCount: number;
  pendingReservations: number;
  averageRating: number;
};

export default function MyRestaurant() {
  const { user } = useAuth();
  const [entries, setEntries] = React.useState<MyRestaurantEntry[]>([]);
  const [openRestaurants, setOpenRestaurants] = React.useState(0);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      const restaurants = await fetchOwnerRestaurants(user.id);

      const entries = [];
      for (const restaurant of restaurants) {
        const [reservations, reviews] = await Promise.all([
          fetchReservationsByRestaurant(restaurant.id),
          fetchReviewsByRestaurantId(restaurant.id),
        ]);

        const reservationCount = reservations.length;
        const averageRating = reviews.avgRating;
        entries.push({
          restaurant,
          reservationCount,
          pendingReservations: reservations.filter(
            (r) => r.status === 'unconfirmed',
          ).length,
          averageRating,
        });
      }
      setEntries(entries);

      const openCount = restaurants.filter((r) => r.status === 'open').length;
      setOpenRestaurants(openCount);
    };
    loadData();
  }, [user]);

  return (
    <View className="p-8 bg-white w-full h-full gap-8">
      {/* header */}
      <View className="mb-6 flex-row items-center justify-between">
        <View className="gap-2">
          <Text className="text-3xl text-[#AF7F4F]">My Restaurants</Text>
          <Text>
            Total: {entries.length} • Open: {openRestaurants}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/restaurant-signup')}
          className="mt-2 flex-row items-center space-x-2 bg-[#AF7F4F] p-2 rounded"
        >
          <Text className="text-white font-bold">+ Add Restaurant</Text>
        </TouchableOpacity>
      </View>

      {/* restaurant list */}
      <ScrollView showsVerticalScrollIndicator={false} className="items-center">
        <View className="flex-row flex-wrap gap-8">
          {entries.map((entry) => (
            <MyRestaurantCard key={entry.restaurant.id} entry={entry} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
