import CategoryRow from '@/components/categoryRow';
import RestaurantGrid from '@/components/restaurantGrid';
import SearchPanel from '@/components/search-panel';
import { View, ScrollView, Text, Image } from 'react-native';

export default function Index() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-1 gap-4 w-full">
        <View className="pt-14 w-full justify-center items-center gap-4">
          <Text className="right-40 text-4xl text-[#E05910]">HEW KAW JANG</Text>
          <Text className="left-10 text-xl">
            From Hunger to Happiness — One Reservation Away.
          </Text>
        </View>
        <View className="w-full justify-center items-center">
          <Image
            source={require('@/assets/images/hewman.png')}
            className="-bottom-8 -left-1/4"
          />
          <SearchPanel />
          <CategoryRow />
          <RestaurantGrid />
        </View>
      </View>
    </ScrollView>
  );
}
