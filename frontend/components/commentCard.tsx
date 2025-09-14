import React from "react";
import { View, Text, Image } from "react-native";
import { Star } from "lucide-react-native"; // icon lib

type CommentProps = {
  name: string;
  avatar: string;
  rating: number; // e.g. 5
  comment: string;
  date: string; // e.g. "1 days ago"
};

const CommentCard: React.FC<CommentProps> = ({ name, avatar, rating, comment, date }) => {
  return (
    <View className="flex-row items-start space-x-3 p-4 rounded-xl">
      {/* Avatar */}
      <Image source={{ uri: avatar }} className="w-10 h-10 rounded-full" />

      {/* Content */}
      <View className="flex-1">
        {/* Name + Stars */}
        <View className="flex-row items-center justify-between">
          <Text className="font-semibold text-gray-900">{name}</Text>
          <Text className="text-gray-400 text-xs">{date}</Text>
        </View>

        {/* Stars */}
        <View className="flex-row items-center mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              color={i < rating ? "#FACC15" : "#D1D5DB"} // yellow-400 or gray-300
              fill={i < rating ? "#FACC15" : "none"}
              className="mr-0.5"
            />
          ))}
          <Text className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</Text>
        </View>

        {/* Comment */}
        <Text className="text-sm text-gray-700 mt-2">{comment}</Text>
      </View>
    </View>
  );
};

export default CommentCard;
