import { View, Text, ScrollView } from 'react-native';
import RestaurantsReportCard from './card';
import { useEffect, useState } from 'react';
import { Restaurant } from '@/types/restaurant.type';
import { fetchRestaurants } from '@/apis/restaurant.api';

interface RestaurantsAdminPanelProps {
  title: string;
  onPressCard: (restaurantId: number) => void;

  mainActionLabel: string;
  onPressMainAction: () => void;

  subActionLabel: string;
  onPressSubAction: () => void;

  statusLabel: string;
}

export default function RestaurantsAdminPanel({
  title,
  onPressCard,
  mainActionLabel,
  onPressMainAction,
  subActionLabel,
  onPressSubAction,
  statusLabel,
}: RestaurantsAdminPanelProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    fetchRestaurants().then((data) => {
      setRestaurants(data);
    });
  }, []);

  return (
    <View className="flex-1 h-full p-4 border border-[#E0E0E0] rounded-lg mr-4 shadow-sm gap-y-4">
      <Text className="text-lg font-semibold mb-2">{title}</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 4 }}
      >
        {restaurants.map((restaurant) => (
          <RestaurantsReportCard
            key={restaurant.id}
            restaurant={restaurant}
            onPressCard={() => onPressCard(restaurant.id)}
            mainActionLabel={mainActionLabel}
            onPressMainAction={onPressMainAction}
            subActionLabel={subActionLabel}
            onPressSubAction={onPressSubAction}
            statusLabel={statusLabel}
          />
        ))}
      </ScrollView>
    </View>
  );
}
