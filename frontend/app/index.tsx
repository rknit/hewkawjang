// index.tsx
import RestaurantDashboard from '@/components/reservation-table';
import RestaurantCard from '@/components/restaurantCard';
import { View, ScrollView } from 'react-native';
import RestaurantGrid from '@/components/restaurantGrid';

export default function Index() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-1 w-full justify-center items-center">
        <RestaurantGrid />
      </View>
    </ScrollView>
  );
}
