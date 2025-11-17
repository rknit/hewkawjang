import React from 'react';
import { View, Text } from 'react-native';

type RestaurantAboutProps = {
  address: string;
  cuisine: string;
  paymentOptions: string[];
};

const RestaurantAbout: React.FC<RestaurantAboutProps> = ({
  address,
  cuisine,
  paymentOptions,
}) => {
  return (
    <View className="p-4 bg-[#FEF9F3] rounded-md shadow">
      {/* Title */}
      <Text className="text-lg font-semibold mb-2">About</Text>

      {/* Address */}
      <Text className="text-gray-700 mb-3">{address}</Text>

      {/* Cuisine */}
      <View className="border-t border-gray-200 pt-2 mt-2">
        <Text className="text-sm text-gray-500 mb-1">Cuisine</Text>
        <Text className="text-gray-700">{cuisine}</Text>
      </View>

      {/* Payment Options */}
      <View className="border-t border-gray-200 pt-2 mt-2">
        <Text className="text-sm text-gray-500 mb-1">Payment Options</Text>
        <Text className="text-gray-700">{paymentOptions.join(', ')}</Text>
      </View>
    </View>
  );
};

export default RestaurantAbout;
