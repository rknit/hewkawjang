import RestaurantsAdminPanel from '@/components/admin/restaurants/panel';
import { View, Text } from 'react-native';

export default function RestaurantsAdminPage() {
  return (
    <View className="p-8 flex-1">
      <Text className="text-xl font-bold mb-4">Restaurants</Text>
      <View className="w-full flex-1 flex-row">
        <RestaurantsAdminPanel
          title="john"
          mainActionLabel="john"
          onPressMainAction={() => {}}
          subActionLabel="john"
          onPressSubAction={() => {}}
          statusLabel="john"
        />

        <RestaurantsAdminPanel
          title="Report"
          mainActionLabel="Ban"
          onPressMainAction={() => {}}
          subActionLabel="Dismiss"
          onPressSubAction={() => {}}
          statusLabel="Waiting for ban review"
        />
      </View>
    </View>
  );
}
