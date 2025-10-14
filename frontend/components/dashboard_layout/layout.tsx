import React, { useState } from 'react';
import SideBar from '../restaurant-sidebar';
import { View, Text } from 'react-native';
import RestaurantScreen from '@/app/(tabs)/Restaurant';
import Dashboard from './dashboard';

export default function DashboardLayout() {
  const [content, setContent] = useState('preview');
  return (
    <View className="flex flex-row bg-neutral-100 h-screen w-screen overflow-hidden">
      <SideBar setContent={setContent} />
      <View className="p-4">
        {content === 'preview' && <RestaurantScreen />}
        {content === 'reservation' && <Text>Reservation Content</Text>}
        {content === 'dashboard' && <Dashboard />}
        {content === 'settings' && <Text>Settings Content</Text>}
      </View>
    </View>
  );
}
