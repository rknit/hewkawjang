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
import { getRestaurantTags, makeRestaurantAddress } from '@/utils/restaurant';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CenteredLoadingIndicator from '@/components/centeredLoading';
import { Star } from 'lucide-react';
import { calculatePriceRange } from '@/utils/price-range';
import Feather from '@expo/vector-icons/Feather';
import { ReportModal } from '@/components/report-modal';
import { reportRestaurant } from '@/apis/report.api';
import { useUser } from '@/hooks/useUser';

export default function RestaurantScreen() {
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

  const [showReportModal, setShowReportModal] = useState(false);

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

  const handlePressReport = async () => {
    await reportRestaurant(restaurantId);
    setShowReportModal(false);
  };

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
              <ImageGallery images={restaurant?.images ?? [fallbackImgUrl]} />

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

        <View className="w-[50%] min-w-[500px] max-w-[600px] mt-[20px] p-[20px] gap-y-8">
          {/* Restaurant Summary */}
          <View className="flex-col gap-y-2">
            <Text className="text-2xl font-bold text-gray-900">
              {restaurant?.name || 'Loading...'}
            </Text>

            <View className="flex-row max-w-[32rem]">
              {/* address */}
              <Text className="text-sm text-gray-600">
                {restaurant ? makeRestaurantAddress(restaurant) : 'Loading...'}
              </Text>

              {/* report button, only available when logged in */}
              {user && (
                <TouchableOpacity
                  className="mt-0.5"
                  onPress={() => setShowReportModal(true)}
                >
                  <Feather name="flag" size={16} color="#9C9C9C" />
                </TouchableOpacity>
              )}
            </View>

            <View className="flex-row gap-x-6">
              {/* tags */}
              <View className="flex-row gap-x-4">
                {restaurant &&
                  getRestaurantTags(restaurant).map((tag) => {
                    return (
                      <Text key={tag} className="text-xs text-gray-600">
                        {tag}
                      </Text>
                    );
                  })}
              </View>

              {/* avg rating */}
              <View className="flex-row items-center">
                <Star size={16} color="gold" fill="gold" />
                <Text className="ml-1 text-gray-800 font-medium">
                  {Number.isInteger(avgRating) ? `${avgRating}.0` : avgRating}
                </Text>
              </View>

              {/* Price Icons */}
              <View className="flex-row space-x-1">
                {Array.from({
                  length: calculatePriceRange(restaurant?.priceRange ?? 0),
                }).map((_, idx) => (
                  <View
                    key={idx}
                    className="w-5 h-5 bg-gray-100 rounded-full items-center justify-center border-black border-[1px]"
                  >
                    <Text className="text-xs">฿</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <ReserveButton restaurantId={restaurant?.id} />
        </View>
      </View>

      <ReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportWhat="restaurant"
        onPressReport={handlePressReport}
      />
    </SafeAreaView>
  );
}
