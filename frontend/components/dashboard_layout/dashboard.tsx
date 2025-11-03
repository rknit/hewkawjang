import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { BarChart2, Wallet, TrendingUp } from 'lucide-react-native';
import DashboardStatGrid from './dashboardStatGrid';
import BookingChart from './bookingChart';
import MonthDropdown from './monthDropdown';
import RestaurantWallet from './restaurantWallet';

interface DashboardProps {
  restaurantId: number;
}

export default function Dashboard({ restaurantId }: DashboardProps) {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const currentMonth = new Date().getMonth() + 1;
  const currentMonthName = monthNames[new Date().getMonth()];

  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [selectedMonthNumber, setSelectedMonthNumber] = useState(currentMonth);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSelect(month: string) {
    setSelectedMonth(month);
    const monthIndex = monthNames.indexOf(month) + 1;
    setSelectedMonthNumber(monthIndex);
  }

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
    console.log('Month changed to:', selectedMonth, selectedMonthNumber);
  }, [selectedMonthNumber]);

  return (
    <ScrollView
      className="flex-1 bg-gradient-to-b from-orange-50 to-white"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
        <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
          <View>
            <Text className="text-sm text-orange-100 font-medium mb-1">
              Welcome back
            </Text>
            <Text className="text-3xl font-extrabold text-white">
              Dashboard
            </Text>
          </View>
          <MonthDropdown
            month={selectedMonthNumber}
            handleMonth={handleSelect}
          />
        </View>

        {/* Wallet Balance Card - Integrated in Header */}
        <View className="px-6 pb-6 -mb-12">
          <View className="bg-white rounded-3xl p-6 shadow-2xl border border-orange-100">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-2xl shadow-md">
                  <Wallet size={24} color="#FFF" strokeWidth={2.5} />
                </View>
                <View className="ml-3">
                  <Text className="text-sm text-gray-500 font-medium">
                    Available Balance
                  </Text>
                  <Text className="text-xs text-gray-400">
                    Ready to withdraw
                  </Text>
                </View>
              </View>
              <View className="bg-green-50 px-3 py-1.5 rounded-full">
                <Text className="text-green-600 font-semibold text-xs">
                  Active
                </Text>
              </View>
            </View>

            <RestaurantWallet restaurantId={restaurantId} />
          </View>
        </View>
      </View>

      {/* Stats Section */}
      <View className="px-6 mt-16">
        <View className="flex-row items-center mb-4">
          <View className="bg-orange-100 p-2 rounded-xl">
            <TrendingUp size={18} color="#F97316" strokeWidth={2.5} />
          </View>
          <Text className="text-lg font-bold text-gray-800 ml-2">
            Performance Metrics
          </Text>
        </View>

        <DashboardStatGrid
          key={`stats-${refreshKey}`}
          restaurantId={restaurantId}
          month={selectedMonthNumber}
        />
      </View>

      {/* Overview Section */}
      <View className="px-6 mt-8 mb-12">
        <View className="flex-row items-center mb-4">
          <View className="bg-orange-100 p-2 rounded-xl">
            <BarChart2 size={18} color="#F97316" strokeWidth={2.5} />
          </View>
          <Text className="text-lg font-bold text-gray-800 ml-2">
            Monthly Overview
          </Text>
        </View>

        <View className="bg-white rounded-3xl p-5 shadow-lg border border-orange-100">
          <BookingChart
            key={`chart-${refreshKey}`}
            restaurantId={restaurantId}
            month={selectedMonthNumber}
          />
        </View>
      </View>
    </ScrollView>
  );
}
