import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

type RestaurantAboutProps = {
  address: string;
  description: string;
  cuisine: string;
  paymentOptions: string[];
};

const RestaurantAbout: React.FC<RestaurantAboutProps> = ({
  address,
  description,
  cuisine,
  paymentOptions,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="p-4 bg-[#FEF9F3] rounded-md shadow">
      {/* Title */}
      <Text className="text-lg font-semibold mb-2">About</Text>

      {/* Address */}
      <Text className="text-gray-700 mb-3">{address}</Text>
      <View className="h-[1px] bg-gray-200 my-2" />
        
      {/* Description */}
      <View className="mb-4">
        <Text
          className="text-gray-600 leading-5"
          numberOfLines={expanded ? undefined : 3}
        >
          {description}
        </Text>
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <View className="items-center mt-2">
            <Text className="text-orange-500 font-medium">
            {expanded ? "Show Less" : "View All"}
            </Text>
        </View>
        </TouchableOpacity>
      </View>

      {/* Cuisine */}
      <View className="border-t border-gray-200 pt-2 mt-2">
        <Text className="text-sm text-gray-500 mb-1">Cuisine</Text>
        <Text className="text-gray-700">{cuisine}</Text>
      </View>

      {/* Payment Options */}
      <View className="border-t border-gray-200 pt-2 mt-2">
        <Text className="text-sm text-gray-500 mb-1">Payment Options</Text>
        <Text className="text-gray-700">{paymentOptions.join(", ")}</Text>
      </View>
    </View>
  );
};

export default RestaurantAbout;
