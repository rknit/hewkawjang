// components/restaurant-dashboard.tsx
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

export default function RestaurantDashboard() {
  // Dummy reservation data
  const reservations = [
    {
      id: 1,
      date: '2025-09-15 19:00',
      customer: 'Alice Johnson',
      status: 'Complete',
      total: 1200,
    },
    {
      id: 2,
      date: '2025-09-16 12:30',
      customer: 'Bob Smith',
      status: 'Cancelled',
      total: 800,
    },
    {
      id: 3,
      date: '2025-09-17 18:45',
      customer: 'Charlie Brown',
      status: 'Complete',
      total: 1500,
    },
  ];

  return (
    <View className="flex-1 bg-white p-4">
      {/* Table Header */}
      <View className="flex-row border-b border-gray-300 pb-2">
        <Text className="w-[10%] font-bold text-black">#</Text>
        <Text className="w-[25%] font-bold text-black">Date</Text>
        <Text className="w-[25%] font-bold text-black">Customer</Text>
        <Text className="w-[15%] font-bold text-black">Status</Text>
        <Text className="w-[15%] font-bold text-black">Total</Text>
        <Text className="w-[10%] font-bold text-black">Action</Text>
      </View>

      {/* Table Rows */}
      <ScrollView className="mt-2">
        {reservations.map((res, index) => (
          <View
            key={res.id}
            className="flex-row items-center border-b border-gray-200 py-2"
          >
            <Text className="w-[10%] text-black">{index + 1}</Text>
            <Text className="w-[25%] text-black">{res.date}</Text>
            <Text className="w-[25%] text-black">{res.customer}</Text>
            <Text className="w-[15%] text-black">{res.status}</Text>
            <Text className="w-[15%] text-black">{res.total}฿</Text>

            {/* Actions */}
            <View className="w-[10%] flex-row space-x-2">
              <TouchableOpacity>
                <Icon name="check" size={20} color="green" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Icon name="trash-2" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
