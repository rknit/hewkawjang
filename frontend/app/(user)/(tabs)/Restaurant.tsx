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
import { SafeAreaView, ScrollView, View } from 'react-native';
import CenteredLoadingIndicator from '@/components/centeredLoading';
import { ReportModal } from '@/components/report-modal';
import { reportRestaurant, reportReview } from '@/apis/report.api';
import { useUser } from '@/hooks/useUser';
import RestaurantReserveSummary from '@/components/restaurantReserveSummary';

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
  const [showReportReviewModal, setShowReportReviewModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const p1 = fetchRestaurantById(restaurantId).then((data) =>
          setRestaurant(data),
        );

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

  const handlePressReport = async () => {
    await reportRestaurant(restaurantId);
    setShowReportModal(false);
  };

  const handlePressReportReview = async () => {
    if (selectedReviewId) {
      await reportReview(Number(selectedReviewId));
      setShowReportReviewModal(false);
      setSelectedReviewId(null);
    }
  };

  const handleReportReview = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setShowReportReviewModal(true);
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
                onPressReport={handleReportReview}
                isLoggedIn={!!user}
                currentUserId={user?.id} // ensure this is a number
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
          <RestaurantReserveSummary
            restaurant={restaurant}
            avgRating={avgRating}
            isLoggedIn={!!user}
            onPressReport={() => setShowReportModal(true)}
          />
        </View>
      </View>

      <ReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportWhat="restaurant"
        onPressReport={handlePressReport}
      />

      <ReportModal
        visible={showReportReviewModal}
        onClose={() => {
          setShowReportReviewModal(false);
          setSelectedReviewId(null);
        }}
        reportWhat="review"
        onPressReport={handlePressReportReview}
      />
    </SafeAreaView>
  );
}
