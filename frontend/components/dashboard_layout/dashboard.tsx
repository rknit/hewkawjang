import React from 'react';
import DashboardStatGrid from './dashboardStatGrid';
import { View, Text, ScrollView } from 'react-native';
import { BarChart2 } from 'lucide-react-native';
import BookingChart from './bookingChart';

export default function Dashboard() {
  return (
    <ScrollView className="w-full h-full">
      <Text className="text-2xl font-bold mb-4">Dashboard</Text>
      <DashboardStatGrid />
      <View className="mt-6">
        <Text className="text-lg font-semibold mb-2">Overview</Text>

        <View className="mt-flex flex-row gap-4 w-full">
          <BookingChart />
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
