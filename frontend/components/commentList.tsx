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
  userId?: number; // author id (may be missing)
};

export type CommentListProps = {
  comments: Comment[];
  onPressReport?: (reviewId: string) => void;
  isLoggedIn?: boolean;
  currentUserId?: number;
  onDeleted?: (id: string) => void;

  // Optional: set of review ids owned by current user
  ownedReviewIds?: Set<number> | number[];
};

const CommentList: React.FC<CommentListProps> = ({
  comments,
  onPressReport,
  isLoggedIn,
  currentUserId,
  onDeleted,
  ownedReviewIds,
}) => {
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
          ItemSeparatorComponent={() => (
            <View className="h-[1px] bg-gray-200 my-2" />
          )}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            // Build owned set from props (if provided)
            let ownedSet: Set<number> | undefined;
            if (Array.isArray(ownedReviewIds)) {
              ownedSet = new Set(ownedReviewIds.map(Number));
            } else if (ownedReviewIds instanceof Set) {
              ownedSet = ownedReviewIds;
            }

            const canDeleteFromSet = ownedSet?.has(Number(item.id)) === true;
            const canDeleteFromUserId =
              !!isLoggedIn &&
              currentUserId !== undefined &&
              item.userId !== undefined &&
              Number(item.userId) === Number(currentUserId);
            const canDelete = canDeleteFromSet || canDeleteFromUserId;

            return (
              <CommentCard
                {...item}
                reviewId={Number(item.id)}
                isLoggedIn={isLoggedIn}
                onPressReport={
                  onPressReport ? () => onPressReport(item.id) : undefined
                }
                canDelete={canDelete}
                onDeleted={(rid) => onDeleted?.(String(rid))}
              />
            );
          }}
        />
      )}
    </View>
  );
};

export default CommentList;
