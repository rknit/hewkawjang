import { fetchOwnerRestaurants } from '@/apis/restaurant.api';
import MyRestaurantCard from '@/components/my_restaurant/myRestaurantCard';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { Scroll } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';

export default function MyRestaurant() {
  const { logout, user } = useAuth();
  const [toDaysReservations, setTodaysReservations] = React.useState(0);
  const [pendngReservations, setPendingReservations] = React.useState(0);
  const [rating, setRating] = React.useState(4.5);
  const [restaurants, setRestaurants] = React.useState<any[]>([]);
  const loadData = async () => {
    // Fetch today's reservations
    if (!user) return;
    const restaurants = await fetchOwnerRestaurants(user.id, 0, 10);
    setRestaurants(restaurants);
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const onRestaurantSignup = () => {
    router.push('/restaurant-signup');
  };

  return (
    <ScrollView className="flex-1 bg-white p-5 gap-4">
      <View className="mb-6 flex-row items-center justify-between">
        <Text className="text-3xl font-bold">My Restaurants</Text>
        <TouchableOpacity
          onPress={() => {
            onRestaurantSignup();
          }}
          className="mt-2 flex-row items-center space-x-2 bg-orange-100 p-2 rounded"
        >
          <Scroll className="text-gray-500" />
          <Text className="text-gray-500">Sign up for restaurant</Text>
        </TouchableOpacity>
      </View>

      <View className="gap-4">
        {restaurants.map((restaurant) => (
          <MyRestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </View>
    </ScrollView>
  );
}
