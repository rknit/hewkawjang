import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Star, ChevronDown } from 'lucide-react-native';

type DayOpeningHour = {
  day: string; // e.g., "Monday"
  openTime: string; // e.g., "09:00"
  closeTime: string; // e.g., "17:00"
};

type RestaurantProps = {
  name: string;
  address: string;
  tags: string[];
  rating: number;
  prices: number; // for now just placeholder, could be actual icon names
  openingHours?: DayOpeningHour[];
};

export default function RestaurantCard({
  name,
  address,
  tags,
  rating,
  prices,
  openingHours,
}: RestaurantProps) {
  const [showOpeningHour, setShowOpeningHour] = useState(false);
  return (
    <View className="bg-white">
      {/* Title */}
      <Text className="text-lg font-bold">{name}</Text>

      {/* Address */}
      <Text className="text-gray-600 mt-1">{address}</Text>

      {/* Tags + Rating */}
      <View className="flex-row items-center flex-wrap mt-3 space-x-2">
        {tags.map((tag, idx) => (
          <Text
            key={idx}
            className="text-gray-700 bg-gray-200 px-2 py-1 rounded mr-2"
          >
            {tag}
          </Text>
        ))}

        {/* Rating */}
        <View className="flex-row items-center ml-2">
          <Star size={16} color="gold" fill="gold" />
          <Text className="ml-1 text-gray-800 font-medium">{rating}</Text>
        </View>

        {/* Icons */}
        <View className="flex-row ml-2 space-x-1">
          {Array.from({ length: prices }).map((_, idx) => (
            <View
              key={idx}
              className="w-5 h-5 bg-gray-100 rounded-full items-center justify-center border-black border-[1px]"
            >
              <Text className="text-xs">$</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Opening Hour */}
      {openingHours && (
        <View className="text-gray-800 mt-4">
          <View className="flex-row items-center mt-2">
            <Text className="text-gray-800 font-medium">Opening Hour</Text>

            <TouchableOpacity
              className="p-2"
              onPress={() => {
                setShowOpeningHour(!showOpeningHour);
              }}
            >
              <ChevronDown size={20} color="gray" />
            </TouchableOpacity>
          </View>

          {showOpeningHour &&
            openingHours.map((day, idx) => (
              <Text key={idx} className="text-gray-800">
                {day.day}: {day.openTime} - {day.closeTime}
              </Text>
            ))}
        </View>
      )}
    </View>
  );
}
