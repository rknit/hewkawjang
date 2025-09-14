import React from "react";
import { View } from "react-native";
import CommentSummary from "./commentSummary";
import CommentList, {CommentListProps} from "./commentList"; // import the props type

interface ReviewSectionProps {
  comments: CommentListProps["comments"];
  average: number;
  totalReviews: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  comments,
  average,
  totalReviews,
  breakdown,
}) => {
  return (
    <View className="p-4 bg-[#FEF9F3] rounded-md shadow">
      <CommentSummary
        average={average}
        totalReviews={totalReviews}
        breakdown={breakdown}
      />
      <View className="h-[1px] bg-gray-200 my-2" />
      <CommentList comments={comments} />
    </View>
  );
};

export default ReviewSection;
