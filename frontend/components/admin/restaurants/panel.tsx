import { View, Text, ScrollView } from 'react-native';
import AdminRestaurantCard from './card';
import { useEffect, useState } from 'react';
import { Restaurant } from '@/types/restaurant.type';
import { fetchRestaurants } from '@/apis/restaurant.api';

interface RestaurantsAdminPanelProps {
  title: string;
  children: React.ReactNode;
}

export default function AdminRestaurantPanel({
  title,
  children,
}: RestaurantsAdminPanelProps) {
  return (
    <View className="flex-1 h-full p-4 border border-[#E0E0E0] rounded-lg mr-4 shadow-sm gap-y-4">
      <Text className="text-lg font-semibold mb-2">{title}</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 4 }}
      >
        {children}
      </ScrollView>
    </View>
  );
}
