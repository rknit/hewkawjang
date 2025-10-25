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
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

const pictures: string[] = [
  'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?auto=format&fit=crop&w=400&q=80', // workspace
  'https://images.unsplash.com/photo-1581291519195-ef11498d1cf2?auto=format&fit=crop&w=400&q=80', // portrait
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', // forest
  'https://images.unsplash.com/photo-1593642532871-8b12e02d091c?auto=format&fit=crop&w=400&q=80', // desk
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80', // mountain
  'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?auto=format&fit=crop&w=400&q=80', // workspace
  'https://images.unsplash.com/photo-1581291519195-ef11498d1cf2?auto=format&fit=crop&w=400&q=80', // portrait
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', // forest
  'https://images.unsplash.com/photo-1593642532871-8b12e02d091c?auto=format&fit=crop&w=400&q=80', // desk
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80', // mountain
];
export default function RestaurantScreen() {
  const params = useLocalSearchParams<{ restaurantId?: string }>();
  // FIXME: handle invalid id
  const restaurantId = Number(params.restaurantId || 1);

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
    fetchRestaurantById(restaurantId).then((data) => setRestaurant(data));

    // Fetch reviews data
    fetchReviewsByRestaurantId(restaurantId).then((data) => {
      setReviews(data.reviews);
      setAvgRating(data.avgRating);
      setBreakdown(data.breakdown);
    });
  }, [restaurantId]);

  const makeAddress = (restaurant: Restaurant): string => {
    const parts = [
      restaurant.houseNo,
      restaurant.village,
      restaurant.building,
      restaurant.road,
      restaurant.soi,
      restaurant.subDistrict,
      restaurant.district,
      restaurant.province,
      restaurant.postalCode,
    ].filter((part) => part && part.trim() !== '');
    return parts.join(', ');
  };

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
              <ImageGallery images={pictures} />

              <ReviewSection
                restaurantId={restaurantId}
                comments={reviews}
                average={avgRating}
                totalReviews={reviews.length}
                breakdown={breakdown}
              />

              <RestaurantAbout
                address={restaurant ? makeAddress(restaurant) : ''}
                description="Pagoda Chinese Restaurant, located on the 4th floor of the Bangkok Marriott Marquis Queen’s Park, invites diners into an elegant Cantonese dining experience. The décor draws inspiration from traditional Chinese pagodas — think ornate lanterns, dragon motifs, warm lacquered woods, and beautifully crafted lattice work — creating a setting that’s both luxurious and welcoming."
                cuisine="Buffet"
                paymentOptions={['MasterCard', 'HewKawJangWallet']}
              />
            </View>
          </ScrollView>
        </View>

        <View className="w-[50%] min-w-[500px] max-w-[600px] mt-[20px] p-[20px]">
          <View className="space-y-4">
            <Text className="text-2xl font-bold text-gray-900">
              {restaurant?.name || 'Loading...'}
            </Text>
            <ReserveButton restaurantId={restaurant?.id} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
