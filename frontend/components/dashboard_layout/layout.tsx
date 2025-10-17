import React, { useState } from 'react';
import SideBar from '../restaurant-sidebar';
import { View, Text } from 'react-native';
import RestaurantScreen from '@/app/(tabs)/Restaurant';
import Dashboard from './dashboard';
import Reservation from './reservation';

interface DashboardLayoutProps {
  restaurantId: number;
}

export default function DashboardLayout({
  restaurantId,
}: DashboardLayoutProps) {
  const [content, setContent] = useState('preview');

  return (
    <View className="flex flex-row bg-neutral-100 h-screen w-screen overflow-auto">
      <SideBar setContent={setContent} />
      <View className="w-full flex-1">
        {content === 'preview' && <RestaurantScreen />}
        {content === 'reservation' && (
          <Reservation restaurantId={restaurantId} />
        )}
        {content === 'dashboard' && <Dashboard restaurantId={1} />}
        {content === 'settings' && <Text>Settings Content</Text>}
      </View>
    </View>
  );
}
