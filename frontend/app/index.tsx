// index.tsx
import RestaurantDashboard from '@/components/reservation-table';
import { View } from 'react-native';

export default function Index() {
  return (
    <View className="flex-1 bg-gray-100">
      <RestaurantDashboard />
    </View>
  );
}
