import { View, Text } from 'react-native';
import React, { useEffect } from 'react';
import { fetchReservationsByRestaurantInOneMonth } from '@/apis/reservation.api';
import { fetchRestaurantById } from '@/apis/restaurant.api';
import { supabase } from '@/utils/supabase';
import { CalendarCheck, Users, Wallet } from 'lucide-react-native'; // ✅ Icons

interface BoxWrapperProps {
  restaurantId: number;
  month: number;
}

function BoxWrapper({ children }: { children: React.ReactNode }) {
  return (
    <View className="bg-white p-4 rounded-2xl flex-1 border border-orange-100 flex items-center justify-center shadow-sm">
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

    setBookings(reservations.length);
    const uniqueCustomers = new Set(reservations.map((r) => r.userId));
    setCustomers(uniqueCustomers.size);

    const restaurant = await fetchRestaurantById(restaurantId);
    setBalance((restaurant as any)?.wallet || 0);
  };

  useEffect(() => {
    loadData();
  }, [restaurantId, month]);

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
          console.log('Database changed — refreshing stats');
          loadData();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  return (
    <View className="flex flex-row gap-4">
      {/* 📅 Total Bookings */}
      <BoxWrapper>
        <View className="flex-row items-center">
          <View className="rounded-full bg-orange-500 h-12 w-12 flex items-center justify-center">
            <CalendarCheck size={24} color="white" />
          </View>
          <View className="pl-4">
            <Text className="text-sm text-gray-500 font-light">
              Total Bookings
            </Text>
            <Text className="text-xl font-semibold text-gray-800">
              {bookings}
            </Text>
          </View>
        </View>
      </BoxWrapper>

      {/* 👥 Total Customers */}
      <BoxWrapper>
        <View className="flex-row items-center">
          <View className="rounded-full bg-yellow-500 h-12 w-12 flex items-center justify-center">
            <Users size={24} color="white" />
          </View>
          <View className="pl-4">
            <Text className="text-sm text-gray-500 font-light">
              Total Customers
            </Text>
            <Text className="text-xl font-semibold text-gray-800">
              {customers}
            </Text>
          </View>
        </View>
      </BoxWrapper>

      {/* 💰 Total Revenue */}
      <BoxWrapper>
        <View className="flex-row items-center">
          <View className="rounded-full bg-green-500 h-12 w-12 flex items-center justify-center">
            <Wallet size={24} color="white" />
          </View>
          <View className="pl-4">
            <Text className="text-sm text-gray-500 font-light">
              Total Revenue
            </Text>
            <Text className="text-xl font-semibold text-gray-800">
              ${balance.toLocaleString()}
            </Text>
          </View>
        </View>
      </BoxWrapper>
    </View>
  );
}
