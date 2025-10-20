import { fetchFilteredReviews } from '@/apis/restaurant.api';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import CommentList, { CommentListProps } from './commentList';
import CommentSummary from './commentSummary';

interface ReviewSectionProps {
  restaurantId: number;
  comments: CommentListProps['comments'];
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
  restaurantId,
  comments,
  average,
  totalReviews,
  breakdown,
}) => {
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [filteredComments, setFilteredComments] =
    useState<CommentListProps['comments']>(comments);
  const [loading, setLoading] = useState(false);

  const fetchFiltered = async (ratings: number[]) => {
    setLoading(true);

    if (ratings.length === 0) {
      // No filter → show all
      setFilteredComments(comments);
      setLoading(false);
      return;
    }

    const allFiltered: CommentListProps['comments'] = [];
    for (const rating of ratings) {
      const data = await fetchFilteredReviews(restaurantId, {
        minRating: rating,
        maxRating: rating,
      });
      allFiltered.push(...data.reviews);
    }

    setFilteredComments(allFiltered);
    setLoading(false);
  };

  // Fetch all reviews on first load
  useEffect(() => {
    fetchFiltered([]);
  }, [restaurantId]);

  // Fetch every time user toggles filter
  useEffect(() => {
    fetchFiltered(selectedRatings);
  }, [selectedRatings]);

  const toggleRating = (rating: number) => {
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating],
    );
  };

  return (
    <View className="p-4 bg-[#FEF9F3] rounded-md shadow">
      <CommentSummary
        average={average}
        totalReviews={totalReviews}
        breakdown={breakdown}
      />

      {/* --- Filter UI --- */}
      <View className="my-4">
        <Text className="text-lg font-semibold mb-2">Filter by Rating</Text>

        <View className="flex flex-row gap-2 justify-between mt-1">
          {[1, 2, 3, 4, 5].map((rating) => {
            const isSelected = selectedRatings.includes(rating);
            return (
              <TouchableOpacity
                key={rating}
                onPress={() => toggleRating(rating)}
                className={`flex-1 py-2 rounded-md flex items-center justify-center border ${
                  isSelected
                    ? 'bg-[#e46d2c] border-[#e46d2c]'
                    : 'bg-white border-gray-300'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isSelected ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {rating}⭐
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* --- Reviews List --- */}
      <View className="h-[1px] bg-gray-200 mb-2" />
      {loading ? (
        <View className="py-6 items-center">
          <ActivityIndicator size="large" color="#facc15" />
          <Text className="text-gray-600 mt-2">Loading reviews...</Text>
        </View>
      ) : (
        <CommentList comments={filteredComments} />
      )}
    </View>
  );
};

export default ReviewSection;
