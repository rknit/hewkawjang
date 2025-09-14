import ReservationTable from '@/components/reservation-table';
import React from 'react';
import { View } from 'react-native';

export default function RestaurantDashboard() {
  return (
    <View className="flex-1 bg-gray-100 p-4">
      <ReservationTable />
    </View>
  );
}
