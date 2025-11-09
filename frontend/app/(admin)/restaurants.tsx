import RestaurantModal from '@/components/admin/restaurants/modal';
import AdminRestaurantVerifyPanel from '@/components/admin/restaurants/verify';
import AdminRestaurantReportPanel from '@/components/admin/restaurants/report';
import { useState } from 'react';
import { View, Text } from 'react-native';

export default function RestaurantsAdminPage() {
  const [viewingRestaurantId, setViewingRestaurantId] = useState<number | null>(
    null,
  );

  const handlePressCard = (restaurantId: number) => {
    setViewingRestaurantId(restaurantId);
  };

  const handleCloseModal = () => {
    setViewingRestaurantId(null);
  };

  return (
    <View className="p-8 flex-1">
      <Text className="text-xl font-bold mb-4">Restaurants</Text>
      <View className="w-full flex-1 flex-row">
        <AdminRestaurantVerifyPanel onPressCard={handlePressCard} />
        <AdminRestaurantReportPanel onPressCard={handlePressCard} />
      </View>

      {viewingRestaurantId && (
        <RestaurantModal
          visible={!!viewingRestaurantId}
          onClose={handleCloseModal}
          restaurantId={viewingRestaurantId}
        />
      )}
    </View>
  );
}
