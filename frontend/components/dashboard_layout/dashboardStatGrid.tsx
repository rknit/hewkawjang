import { View, Text } from 'react-native';
import React, { use, useEffect } from 'react';

import { ReactNode } from 'react';
import { fetchReservationsByRestaurantInOneMonth } from '@/apis/reservation.api';
import { set } from 'zod';
import { fetchRestaurantById } from '@/apis/restaurant.api';
import { supabase } from '@/utils/supabase';

interface BoxWrapperProps {
  restaurantId: number;
  month: number;
}

function BoxWrapper({ children }: { children: ReactNode }) {
  return (
    <View className="bg-white p-4 rounded-sm flex-1 border border-gray-200 flex items-center shadow-sm">
      {children}
    </View>
  );
}

export default function DashboardStatGrid({
  restaurantId,
  month,
}: BoxWrapperProps) {
  const [balance, setBalance] = React.useState(0);
  const [bookings, setBookings] = React.useState(0);
  const [customers, setCustomers] = React.useState(0);

  const loadData = async () => {
    const reservations = await fetchReservationsByRestaurantInOneMonth(
      restaurantId,
      month,
      new Date().getFullYear(),
    );

    if (!reservations) return;

    // Example aggregation by day (or by week)
    setBookings(reservations.length);
    const uniqueCustomers = new Set(reservations.map((r) => r.userId));
    setCustomers(uniqueCustomers.size);
    const restaurant = await fetchRestaurantById(restaurantId);
    setBalance((restaurant as any)?.wallet || 0);
  };

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  useEffect(() => {
    const channel = supabase
      .channel('realtime:reservations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restaurants',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          console.log('Database changed — refreshing chart');
          loadData();
        },
      )
      .subscribe();

    return () => {
      // Call removeChannel but don't return the Promise to React's cleanup
      void supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  return (
    <View className="flex flex-row w-1200 gap-4">
      <BoxWrapper>
        <View className="flex flex-row items-center">
          <View className="rounded-full bg-blue-500 h-12 w-12 flex items-center justify-center">
            <Text className="text-white font-bold text-lg">A</Text>
          </View>
          <View className="pl-4">
            <Text className="text-sm text-gray-500 font-light">
              Total Bookings
            </Text>
            <Text className="text-xl font-semibold text-gray-700">
              {bookings}
            </Text>
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
            <Text className="text-xl font-semibold text-gray-700">
              {customers}
            </Text>
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
            <Text className="text-xl font-semibold text-gray-700">
              ${balance}
            </Text>
          </View>
        </View>
      </BoxWrapper>
    </View>
  );
}
