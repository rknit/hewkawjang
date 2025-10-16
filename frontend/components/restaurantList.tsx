import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import RecommendedRestaurantCard from './recom-restaurant-card';
import type { Restaurant, RestaurantWithRating }  from '@/types/restaurant.type';

interface RestaurantListProps {
  restaurants: RestaurantWithRating[];
  loading?: boolean;
  error?: string | null;
}

export default function RestaurantList({
  restaurants,
  loading = false,
  error = null,
}: RestaurantListProps) {

  const makeAddress = (restaurant: Restaurant): string => {
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
  };

  // Transform restaurant data to match recom card props
  const transformRestaurantData = (restaurant: RestaurantWithRating) => {
    const getPriceLevel = (price: number) => {
      if (price <= 250) return 1;
      if (price <= 750) return 2;
      if (price <= 2000) return 3;
      return 4;
    };

    const tags = [restaurant.cuisineType];
    if (restaurant.district) {
      tags.push(restaurant.district);
    }

    const address = makeAddress(restaurant);

    return {
      id: restaurant.id,
      name: restaurant.name,
      address: address,
      tags: tags,
      rating: Math.round((restaurant.avgRating || 0) * 100) / 100, // round to 2 decimal
      prices: getPriceLevel(restaurant.priceRange || 0),
      image: { uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop' },
      isNew: restaurant.reviewCount == 0,
    };
  };

  const renderRestaurantCard = (restaurant: RestaurantWithRating) => {
    const cardProps = transformRestaurantData(restaurant);
    
    return (
      <View key={restaurant.id} className="mb-4">
        <RecommendedRestaurantCard {...cardProps} />
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center py-12">
        <ActivityIndicator size="large" color="#E05910" />
        <Text className="mt-4 text-gray-600">Loading restaurants...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center py-12 px-4">
        <Text className="text-lg font-bold text-red-600 mb-2">Oops!</Text>
        <Text className="text-gray-600 text-center">{error}</Text>
      </View>
    );
  }

  if (restaurants.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-12">
        <Text className="text-lg font-semibold text-gray-700 mb-2">No restaurants found</Text>
        <Text className="text-gray-500 text-center px-4">
          Try adjusting your search filters or search terms
        </Text>
      </View>
    );
  }

  return (
    <View className="px-4">
      {restaurants.map(renderRestaurantCard)}
    </View>
  );
}