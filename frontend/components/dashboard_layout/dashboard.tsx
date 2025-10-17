import React from 'react';
import DashboardStatGrid from './dashboardStatGrid';
import { View, Text, ScrollView } from 'react-native';
import { BarChart2 } from 'lucide-react-native';
import BookingChart from './bookingChart';
import Reservation from './reservation';

interface DashboardProps {
  restaurantId: number;
}

export default function Dashboard({ restaurantId }: DashboardProps) {
  return (
    <ScrollView className="w-full p-6">
      <Text className="text-2xl font-bold mb-4">Dashboard</Text>
      <DashboardStatGrid restaurantId={1} month={1} />

      <View className="mt-6">
        <Text className="text-lg font-semibold mb-2">Overview</Text>

        <View className="flex-row gap-4 w-full">
          <BookingChart restaurantId={1} month={1} />
        </View>
      </View>
      <View className="mt-6">
        <Text className="text-lg font-semibold mb-2">Recent Activities</Text>
        <View className="bg-white p-4 rounded shadow">
          <Text className="text-gray-500">No recent activities.</Text>
        </View>
      </View>
    </ScrollView>
  );
}
