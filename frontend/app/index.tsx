import CategoryRow from '@/components/categoryRow';
import RestaurantGrid from '@/components/restaurantGrid';
import { View, ScrollView } from 'react-native';

export default function Index() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-1 gap-12 w-full justify-center items-center">
        <CategoryRow />
        <RestaurantGrid />
      </View>
    </ScrollView>
  );
}
