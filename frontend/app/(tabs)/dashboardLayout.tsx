import React, { use, useState } from 'react';
import SideBar from '../../components/restaurant-sidebar';
import { View, Text } from 'react-native';
import RestaurantScreen from '@/app/(tabs)/Restaurant';
import Dashboard from '../../components/dashboard_layout/dashboard';
import Reservation from '../../components/dashboard_layout/reservation';
import Restaurant from '@/app/(tabs)/RestaurantPreview';
import { useLocalSearchParams } from 'expo-router';

export default function DashboardLayout() {
  const [content, setContent] = useState('preview');
  const params = useLocalSearchParams<{ restaurantId?: string }>();
  const restaurantId = Number(params.restaurantId || 1);
  return (
    <View className="flex flex-row bg-neutral-100 h-screen w-screen overflow-auto">
      <SideBar setContent={setContent} />
      <View className="w-full flex-1">
        {content === 'preview' && <Restaurant />}
        {content === 'reservation' && (
          <Reservation restaurantId={restaurantId} />
        )}
        {content === 'dashboard' && <Dashboard restaurantId={restaurantId} />}
        {content === 'settings' && <Restaurant />}
      </View>
    </View>
  );
}
