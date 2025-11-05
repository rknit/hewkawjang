import RestaurantModal from '@/components/admin/restaurants/modal';
import RestaurantsAdminPanel from '@/components/admin/restaurants/panel';
import { useAdmin } from '@/context/AdminContext';
import { useState } from 'react';
import { View, Text } from 'react-native';

export default function RestaurantsAdminPage() {
  const { reports } = useAdmin();

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
        <RestaurantsAdminPanel
          title="john"
          restaurantIds={[]}
          onPressCard={handlePressCard}
          mainActionLabel="john"
          onPressMainAction={() => {}}
          subActionLabel="john"
          onPressSubAction={() => {}}
          statusLabel="john"
        />

        <RestaurantsAdminPanel
          title="Report"
          restaurantIds={reports
            .filter((r) => r.reportType === 'restaurant')
            .map((r) => r.targetRestaurantId!)}
          onPressCard={handlePressCard}
          mainActionLabel="Ban"
          onPressMainAction={() => {}}
          subActionLabel="Dismiss"
          onPressSubAction={() => {}}
          statusLabel="Waiting for ban review"
        />
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
