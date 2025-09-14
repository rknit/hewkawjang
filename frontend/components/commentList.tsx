import React from "react";
import { View, FlatList } from "react-native";
import CommentCard from "./commentCard"; // adjust path if needed

type Comment = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
};

export type CommentListProps = {
  comments: Comment[];
};

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  return (
    <View className="p-4 h-[400px]">
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CommentCard {...item} />}
        ItemSeparatorComponent={() => (
          <View className="h-[1px] bg-gray-200 my-2" />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default CommentList;
