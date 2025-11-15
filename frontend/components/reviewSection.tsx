import { fetchFilteredReviews } from '@/apis/restaurant.api';
import { fetchMyReviewIdsByRestaurant } from '@/apis/user.api';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View, Text } from 'react-native';
import CommentList, { CommentListProps } from './commentList';
import CommentSummary from './commentSummary';

interface ReviewSectionProps {
  restaurantId: number;
  comments: CommentListProps['comments'];
  average: number;
  totalReviews: number;
  breakdown: { 5: number; 4: number; 3: number; 2: number; 1: number };
  onPressReport?: (reviewId: string) => void;
  isLoggedIn?: boolean;
  currentUserId?: number;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  restaurantId,
  comments,
  average,
  totalReviews,
  breakdown,
  onPressReport,
  isLoggedIn,
  currentUserId,
}) => {
  const [selectedRatings, setSelectedRatings] = useState<number[]>([
    1, 2, 3, 4, 5,
  ]);

  // Loading for the list area (kept simple here)
  const [loading] = useState(false);

  // Track deleted ids so they don't reappear when filters change
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // NEW: review ids owned by current user for this restaurant
  const [ownedReviewIds, setOwnedReviewIds] = useState<Set<number>>(new Set());

  // Fetch owned review ids for this restaurant (needed to show delete button)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!isLoggedIn) {
        setOwnedReviewIds(new Set());
        return;
      }
      try {
        const ids = await fetchMyReviewIdsByRestaurant(restaurantId);
        const set = new Set(ids.map(Number));
        if (!cancelled) setOwnedReviewIds(set);
        if (__DEV__)
          console.log('[ReviewSection] ownedReviewIds', Array.from(set));
      } catch (e) {
        if (__DEV__) console.warn('[ReviewSection] fetchMyReviewIds failed', e);
        if (!cancelled) setOwnedReviewIds(new Set());
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [restaurantId, isLoggedIn]);

  // Base list excluding deleted ids
  const baseList = useMemo(
    () => comments.filter((c) => !deletedIds.has(c.id)),
    [comments, deletedIds],
  );

  // Apply client-side filter by selected ratings
  const list = useMemo(() => {
    if (selectedRatings.length === 5) return baseList;
    const allowed = new Set(selectedRatings);
    return baseList.filter((c) => allowed.has(Math.round(Number(c.rating))));
  }, [baseList, selectedRatings]);

  // Toggle rating filter chips
  const toggleRating = (rating: number) => {
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating],
    );
  };

  // Remove from UI after delete
  const handleDeleted = (id: string) => {
    setDeletedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setOwnedReviewIds((prev) => {
      const next = new Set(prev);
      next.delete(Number(id));
      return next;
    });
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
                  className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-700'}`}
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
        <CommentList
          comments={list}
          onPressReport={onPressReport}
          isLoggedIn={isLoggedIn}
          currentUserId={currentUserId}
          onDeleted={handleDeleted}
          ownedReviewIds={ownedReviewIds} // NEW: drives the canDelete flag
        />
      )}
    </View>
  );
};

export default ReviewSection;
