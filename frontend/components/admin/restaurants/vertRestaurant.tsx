import {
  fetchRestaurantById,
  fetchReviewsByRestaurantId,
} from '@/apis/restaurant.api';
import ImageGallery from '@/components/image-gallery';
import RestaurantAbout from '@/components/restaurantAbout';
import ReviewSection from '@/components/reviewSection';
import { Restaurant } from '@/types/restaurant.type';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text } from 'react-native';
import { Comment } from '@/types/review.type';
import { makeRestaurantAddress } from '@/utils/restaurant';
import RestaurantReserveSummary from '@/components/restaurantReserveSummary';

interface RestaurantScreenVerticalProps {
  restaurantId: number;
}

export default function RestaurantScreenVertical({
  restaurantId,
}: RestaurantScreenVerticalProps) {
  const fallbackImgUrl =
    'https://uhrpfnyjcvpwoaioviih.supabase.co/storage/v1/object/public/test/photo-1517248135467-4c7edcad34c4.jpg';

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
    // Fetch restaurant data
    fetchRestaurantById(restaurantId).then((data) => {
      setRestaurant(data);
    });

    // Fetch reviews data
    fetchReviewsByRestaurantId(restaurantId).then((data) => {
      setReviews(data.reviews);
      setAvgRating(data.avgRating);
      setBreakdown(data.breakdown);
    });
  }, [restaurantId]);

  return (
    <SafeAreaView className="flex-1 bg-white items-center">
      <View className="flex-1 flex-col w-full p-5 gap-y-8">
        <RestaurantReserveSummary
          restaurant={restaurant}
          avgRating={avgRating}
          isLoggedIn={false}
          disableReserveButton
        />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="space-y-6">
            <ImageGallery images={restaurant?.images || [fallbackImgUrl]} />

            <ReviewSection
              restaurantId={restaurantId}
              comments={reviews}
              average={avgRating}
              totalReviews={reviews.length}
              breakdown={breakdown}
            />

            <RestaurantAbout
              address={restaurant ? makeRestaurantAddress(restaurant) : ''}
              description="Pagoda Chinese Restaurant, located on the 4th floor of the Bangkok Marriott Marquis Queen's Park, invites diners into an elegant Cantonese dining experience. The décor draws inspiration from traditional Chinese pagodas — think ornate lanterns, dragon motifs, warm lacquered woods, and beautifully crafted lattice work — creating a setting that's both luxurious and welcoming."
              cuisine="Buffet"
              paymentOptions={['MasterCard', 'HewKawJangWallet']}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
