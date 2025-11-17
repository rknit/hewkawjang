import {
  fetchRestaurantById,
  fetchReviewsByRestaurantId,
} from '@/apis/restaurant.api';
import ImageGallery from '@/components/image-gallery';
import RestaurantAbout from '@/components/restaurantAbout';
import ReviewSection from '@/components/reviewSection';
import { Restaurant } from '@/types/restaurant.type';
import { Comment } from '@/types/review.type';
import { makeRestaurantAddress } from '@/utils/restaurant';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text } from 'react-native';
import CenteredLoadingIndicator from '@/components/centeredLoading';
import { useUser } from '@/hooks/useUser';
import RestaurantReserveSummary from '@/components/restaurantReserveSummary';

export default function RestaurantPreveiew() {
  const fallbackImgUrl =
    'https://uhrpfnyjcvpwoaioviih.supabase.co/storage/v1/object/public/test/photo-1517248135467-4c7edcad34c4.jpg';

  const params = useLocalSearchParams<{ restaurantId?: string }>();
  const { user } = useUser();
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
      try {
        const p1 = fetchRestaurantById(restaurantId).then((data) => {
          setRestaurant(data);
          console.log(data);
        });

        const p2 = fetchReviewsByRestaurantId(restaurantId).then((data) => {
          setReviews(data.reviews);
          setAvgRating(data.avgRating);
          setBreakdown(data.breakdown);

          // DEBUG: confirm reviews include userId and ids are numbers/strings
          if (__DEV__) {
            console.log('[Restaurant] user id:', user?.id);
            console.log(
              '[Restaurant] sample reviews:',
              (data.reviews || []).slice(0, 3).map((r: any) => ({
                id: r?.id,
                userId: r?.userId,
                typeofId: typeof r?.id,
                typeofUserId: typeof r?.userId,
              })),
            );
          }
        });

        await Promise.all([p1, p2]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [restaurantId]);

  if (isLoading) {
    return <CenteredLoadingIndicator />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white items-center">
      <View className="w-[100%] flex bg-gray-300 p-2 items-center justify-center">
        <Text className="text-black text-base mr-[10px]">
          This is your Restaurant Preview
        </Text>
      </View>
      <View className="flex-1 flex-row w-full justify-center">
        <View className="w-[50%] min-w-[500px] max-w-[600px]">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="space-y-6">
              <ImageGallery images={restaurant?.images ?? [fallbackImgUrl]} />

              <ReviewSection
                restaurantId={restaurantId}
                comments={reviews}
                average={avgRating}
                totalReviews={reviews.length}
                breakdown={breakdown}
                isLoggedIn={!!user}
                currentUserId={user?.id} // ensure this is a number
              />

              <RestaurantAbout
                address={restaurant ? makeRestaurantAddress(restaurant) : ''}
                cuisine="Buffet"
                paymentOptions={restaurant ? [restaurant.paymentMethod] : []}
              />
            </View>
          </ScrollView>
        </View>

        <View className="w-[50%] min-w-[500px] max-w-[600px] mt-[20px] p-[20px] gap-y-8">
          <RestaurantReserveSummary
            restaurant={restaurant}
            avgRating={avgRating}
            isLoggedIn={!!user}
            disableReserveButton={true}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
