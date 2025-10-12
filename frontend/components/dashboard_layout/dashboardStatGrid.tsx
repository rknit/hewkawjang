import { View, Text } from 'react-native';
import React from 'react';

import { ReactNode } from 'react';

function BoxWrapper({ children }: { children: ReactNode }) {
  return (
    <View className="bg-white p-4 rounded-sm flex-1 border border-gray-200 flex items-center shadow-sm">
      {children}
    </View>
  );
}

export default function DashboardStatGrid() {
  return (
    <View className="flex flex-row gap-4">
      <BoxWrapper>
        <View className="flex flex-row items-center">
          <View className="rounded-full bg-blue-500 h-12 w-12 flex items-center justify-center">
            <Text className="text-white font-bold text-lg">A</Text>
          </View>
          <View className="pl-4">
            <Text className="text-sm text-gray-500 font-light">
              Total Bookings
            </Text>
            <Text className="text-xl font-semibold text-gray-700">1,234</Text>
          </View>
        </View>
      </BoxWrapper>
      <BoxWrapper>
        <View className="flex flex-row items-center">
          <View className="rounded-full bg-green-500 h-12 w-12 flex items-center justify-center">
            <Text className="text-white font-bold text-lg">B</Text>
          </View>
          <View className="pl-4">
            <Text className="text-sm text-gray-500 font-light">
              Total Customers
            </Text>
            <Text className="text-xl font-semibold text-gray-700">567</Text>
          </View>
        </View>
      </BoxWrapper>
      <BoxWrapper>
        <View className="flex flex-row items-center">
          <View className="rounded-full bg-red-500 h-12 w-12 flex items-center justify-center">
            <Text className="text-white font-bold text-lg">C</Text>
          </View>
          <View className="pl-4">
            <Text className="text-sm text-gray-500 font-light">
              Total Revenue
            </Text>
            <Text className="text-xl font-semibold text-gray-700">$12,345</Text>
          </View>
        </View>
      </BoxWrapper>
    </View>
  );
}
