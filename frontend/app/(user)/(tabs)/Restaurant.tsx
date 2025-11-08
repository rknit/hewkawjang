import {
  fetchRestaurantById,
  fetchReviewsByRestaurantId,
} from '@/apis/restaurant.api';
import ImageGallery from '@/components/image-gallery';
import ReserveButton from '@/components/reserve-button';
import RestaurantAbout from '@/components/restaurantAbout';
import ReviewSection from '@/components/reviewSection';
import { Restaurant } from '@/types/restaurant.type';
import { Comment } from '@/types/review.type';
import { makeRestaurantAddress } from '@/utils/restaurant';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import CenteredLoadingIndicator from '@/components/centeredLoading';
import Feather from '@expo/vector-icons/Feather';

export default function RestaurantScreen() {
  const params = useLocalSearchParams<{ restaurantId?: string }>();
  const [isLoading, setIsLoading] = useState(true);

  const restaurantId = Number(params.restaurantId);
  if (!restaurantId || isNaN(restaurantId)) {
    // FIXME: Handle invalid restaurant ID more gracefully
    throw new Error('Invalid restaurant ID');
  }

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Comment[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<{
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  }>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Fetch restaurant data
      const p1 = fetchRestaurantById(restaurantId).then((data) =>
        setRestaurant(data),
      );

      // Fetch reviews data
      const p2 = fetchReviewsByRestaurantId(restaurantId).then((data) => {
        setReviews(data.reviews);
        setAvgRating(data.avgRating);
        setBreakdown(data.breakdown);
      });

      await Promise.all([p1, p2]);

      setIsLoading(false);
    };

    loadData();
  }, [restaurantId]);

  if (isLoading) {
    return <CenteredLoadingIndicator />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white items-center">
      <View className="flex-1 flex-row w-full justify-center">
        <View className="w-[50%] min-w-[500px] max-w-[600px] h-full">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="space-y-6">
              <ImageGallery images={restaurant?.images || []} />

              <ReviewSection
                restaurantId={restaurantId}
                comments={reviews}
                average={avgRating}
                totalReviews={reviews.length}
                breakdown={breakdown}
              />

              <RestaurantAbout
                address={restaurant ? makeRestaurantAddress(restaurant) : ''}
                description="Pagoda Chinese Restaurant, located on the 4th floor of the Bangkok Marriott Marquis Queen’s Park, invites diners into an elegant Cantonese dining experience. The décor draws inspiration from traditional Chinese pagodas — think ornate lanterns, dragon motifs, warm lacquered woods, and beautifully crafted lattice work — creating a setting that’s both luxurious and welcoming."
                cuisine="Buffet"
                paymentOptions={['MasterCard', 'HewKawJangWallet']}
              />
            </View>
          </ScrollView>
        </View>

        <View className="w-[50%] min-w-[500px] max-w-[600px] mt-[20px] p-[20px]">
          <View className="space-y-4">
            {/* Restaurant Summary */}
            <View className="flex-col gap-y-2">
              <Text className="text-2xl font-bold text-gray-900">
                {restaurant?.name || 'Loading...'}
              </Text>

              <Text className="text-sm text-black">
                {restaurant ? makeRestaurantAddress(restaurant) : 'Loading...'}
              </Text>
            </View>

            <ReserveButton restaurantId={restaurant?.id} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
