import React, { useEffect } from 'react';
import { View, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ImageGallery from '@/components/image-gallery';
import RestaurantAbout from '@/components/restaurantAbout';
import ReviewSection from '@/components/reviewSection';
import { Restaurant } from '@/types/restaurant.type';
import { fetchRestaurantById } from '@/apis/restaurant.api';

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
const mockComments = [
  {
    id: '1',
    name: 'BankEatLaek',
    avatar: 'https://placekitten.com/100/100',
    rating: 5,
    comment:
      'Amazing experience from start to finish! The food was fresh, flavorful, and beautifully presented. Service was friendly and attentive, and the atmosphere made it perfect for a memorable night out.',
    date: '1 days ago',
  },
  {
    id: '2',
    name: 'FoodieGirl',
    avatar: 'https://placekitten.com/101/101',
    rating: 4,
    comment:
      'The food was really good, but the service was a bit slow. Still, worth a visit!',
    date: '3 days ago',
  },
  {
    id: '3',
    name: 'HungryMan',
    avatar: 'https://placekitten.com/102/102',
    rating: 5,
    comment:
      'Best dining experience I’ve had in a long time. Highly recommended!',
    date: '5 days ago',
  },
  {
    id: '4',
    name: 'BankEatLaek',
    avatar: 'https://placekitten.com/100/100',
    rating: 5,
    comment:
      'Amazing experience from start to finish! The food was fresh, flavorful, and beautifully presented. Service was friendly and attentive, and the atmosphere made it perfect for a memorable night out.',
    date: '1 days ago',
  },
  {
    id: '5',
    name: 'FoodieGirl',
    avatar: 'https://placekitten.com/101/101',
    rating: 4,
    comment:
      'The food was really good, but the service was a bit slow. Still, worth a visit!',
    date: '3 days ago',
  },
  {
    id: '6',
    name: 'HungryMan',
    avatar: 'https://placekitten.com/102/102',
    rating: 5,
    comment:
      'Best dining experience I’ve had in a long time. Highly recommended!',
    date: '5 days ago',
  },
];

export default function RestaurantScreen() {
  const params = useLocalSearchParams<{ restaurantId?: string }>();
  // FIXME: handle invalid id
  const restaurantId = Number(params.restaurantId || 1);

  const [restaurant, setRestaurant] = React.useState<Restaurant | null>(null);
  useEffect(() => {
    fetchRestaurantById(restaurantId).then((data) => setRestaurant(data));
  }, [restaurantId]);

  return (
    <SafeAreaView className="flex-1 bg-white items-center">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row">
          {/* First column */}
          <View className="w-[50%] min-w-[500px] max-w-[600px] p-[20px] space-y-6">
            <ImageGallery images={pictures} />

            <ReviewSection
              comments={mockComments}
              average={4.5}
              totalReviews={2900}
              breakdown={{ 5: 2000, 4: 600, 3: 200, 2: 80, 1: 20 }}
            />

            <RestaurantAbout
              address="199 Sukhumvit Soi22, Klong Ton, Klongtoey, Bangkok 10110, Bangkok"
              description="Pagoda Chinese Restaurant, located on the 4th floor of the Bangkok Marriott Marquis Queen’s Park, invites diners into an elegant Cantonese dining experience. The décor draws inspiration from traditional Chinese pagodas — think ornate lanterns, dragon motifs, warm lacquered woods, and beautifully crafted lattice work — creating a setting that’s both luxurious and welcoming."
              cuisine="Buffet"
              paymentOptions={['MasterCard', 'HewKawJangWallet']}
            />
          </View>

          {/* Second column */}
          <View className="w-[50%] min-w-[500px] max-w-[600px] bg-gray-100 p-[20px]">
            {/* Placeholder for content */}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
