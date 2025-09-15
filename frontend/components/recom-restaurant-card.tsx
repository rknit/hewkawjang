import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Star, ChevronDown } from 'lucide-react-native';

type DayOpeningHour = {
  day: string;
  openTime: string;
  closeTime: string;
};

type RestaurantCardWithImageProps = {
  id: number;
  name: string;
  address: string;
  tags: string[];
  rating: number;
  prices: number;
  image: any; // fallback to any since ImageSourcePropType is not imported
  isNew?: boolean;
  openingHours?: DayOpeningHour[];
};

export default function RecommendedRestaurantCard({
  name,
  address,
  tags,
  rating,
  prices,
  image,
  isNew = false,
  openingHours,
}: RestaurantCardWithImageProps) {
  const [showOpeningHour, setShowOpeningHour] = React.useState(false);
  return (
    <View className="bg-white rounded-lg overflow-hidden shadow-md flex-row w-full">
      {/* Image */}
      <View className="relative w-2/5 min-w-[120px] max-w-[180px]">
        <Image source={image} className="w-full h-full" resizeMode="cover" />
        {isNew && (
          <View className="absolute top-1 right-1 bg-orange-500 px-1 py-0.5 rounded">
            <Text className="text-white text-xs font-bold">NEW</Text>
          </View>
        )}
      </View>

      {/* Content - Inlined RestaurantCard */}
      <View className="flex-1 p-3 justify-center min-w-0">
        <View className="bg-white">
          {/* Title */}
          <Text
            className="text-lg font-bold"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {name}
          </Text>

          {/* Address */}
          <Text
            className="text-gray-600 mt-1"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {address}
          </Text>

          {/* Tags */}
          <View className="flex-row items-center flex-wrap mt-3">
            {tags.map((tag, idx) => (
              <Text
                key={idx}
                className="text-gray-700 bg-gray-200 px-2 py-1 rounded mr-2 max-w-[80px]"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {tag}
              </Text>
            ))}
          </View>

          {/* Rating & Price */}
          <View className="flex-row items-center mt-2">
            <View className="flex-row items-center">
              <Star size={16} color="gold" fill="gold" />
              <Text className="ml-1 text-gray-800 font-medium">{rating}</Text>
            </View>

            {/* Price Icons */}
            <View className="flex-row ml-4 space-x-1">
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
      </View>
    </View>
  );
}
