import React from "react";
import { View, Text } from "react-native";
import { StarIcon as StarSolid } from "react-native-heroicons/solid";

type SummaryProps = {
  average: number;
  totalReviews: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
};

const CommentSummary: React.FC<SummaryProps> = ({ average, totalReviews, breakdown }) => {
  const maxCount = Math.max(...Object.values(breakdown));

  const renderBar = (stars: 1 | 2 | 3 | 4 | 5, color: string) => {
    const count = breakdown[stars];
    // If maxCount is 0 (no reviews), set percentage to 0 instead of NaN
    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

    return (
      <View className="flex-row items-center mb-1" key={stars}>
        <Text className="w-4 text-sm">{stars}</Text>
        <StarSolid size={14} color="#FACC15" />
        <View className="flex-1 h-2 mx-2 bg-gray-300 rounded-full overflow-hidden">
          <View
            className="h-2 rounded-full"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </View>
      </View>
    );
  };

  return (
    <View className="p-4">
      <Text className="text-lg font-semibold mb-3">Review</Text>

      {/* Rating Bars */}
      <View className="flex-row">
        <View className="flex-1">
          {renderBar(5, "green")}
          {renderBar(4, "limegreen")}
          {renderBar(3, "gold")}
          {renderBar(2, "orange")}
          {renderBar(1, "red")}
        </View>

        {/* Average rating */}
        <View className="w-[120px] items-center justify-center">
          <Text className="text-3xl font-bold">{average.toFixed(1)}</Text>
          <View className="flex-row my-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarSolid
                key={i}
                size={18}
                color={i < Math.round(average) ? "gold" : "#ddd"}
              />
            ))}
          </View>
          <Text className="text-xs text-gray-500 text-center">
            Based on {totalReviews.toLocaleString()} reviews
          </Text>
        </View>
      </View>
    </View>
  );
};

export default CommentSummary;
