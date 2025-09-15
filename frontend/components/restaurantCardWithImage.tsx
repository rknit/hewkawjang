import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';
import RestaurantCard from './restaurantCard';

type DayOpeningHour = {
  day: string;
  openTime: string;
  closeTime: string;
};

type RestaurantCardWithImageProps = {
  name: string;
  address: string;
  tags: string[];
  rating: number;
  prices: number;
  image: ImageSourcePropType;
  isNew?: boolean;
  openingHours?: DayOpeningHour[];
};

export default function RestaurantCardWithImage({
  name,
  address,
  tags,
  rating,
  prices,
  image,
  isNew = false,
  openingHours,
}: RestaurantCardWithImageProps) {
  return (
    <View className="bg-white rounded-lg overflow-hidden shadow-md flex-row">
      {/* Image */}
      <View className="relative w-48">
        <Image source={image} className="w-full h-full" resizeMode="cover" />
        {isNew && (
          <View className="absolute top-1 right-1 bg-orange-500 px-1 py-0.5 rounded">
            <Text className="text-white text-xs font-bold">NEW</Text>
          </View>
        )}
      </View>

      {/* Content - Reusing RestaurantCard */}
      <View className="flex-1 p-3 justify-center">
        <RestaurantCard
          name={name}
          address={address}
          tags={tags}
          rating={rating}
          prices={prices}
          openingHours={openingHours}
        />
      </View>
    </View>
  );
}
