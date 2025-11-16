import React from "react";
import { View, FlatList, Text } from "react-native";
import CommentCard from "./commentCard"; // adjust path if needed

type Comment = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  attachPhotos?: string[];
};

export type CommentListProps = {
  comments: Comment[];
  onPressReport?: (reviewId: string) => void;
  isLoggedIn?: boolean;
};

const CommentList: React.FC<CommentListProps> = ({ comments, onPressReport, isLoggedIn }) => {
  return (
    <View className="p-4 h-[400px]">
      {comments.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 text-base">No reviews yet</Text>
        </View>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CommentCard
              {...item}
              onPressReport={onPressReport ? () => onPressReport(item.id) : undefined}
              isLoggedIn={isLoggedIn}
            />
          )}
          ItemSeparatorComponent={() => (
            <View className="h-[1px] bg-gray-200 my-2" />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default CommentList;
