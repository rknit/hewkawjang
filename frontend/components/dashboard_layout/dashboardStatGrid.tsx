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
  const [revenue, setRevenue] = React.useState(0);
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

    // Calculate total revenue from completed reservations that have been paid to restaurant
    // This includes: no-show (95%), late cancellations (90-95%), and other restaurant payouts
    const totalRevenue = reservations.reduce((sum, reservation) => {
      // Only count reservations where restaurant received money
      if (
        reservation.status === 'completed' ||
        reservation.status === 'uncompleted' || // no-show case
        reservation.status === 'cancelled' // if cancelled after confirmation, restaurant gets payout
      ) {
        return sum + (reservation.reservationFee || 0);
      }
      return sum;
    }, 0);

    setRevenue(totalRevenue);
  };

  useEffect(() => {
    loadData();
  }, [restaurantId, month]);

  // Real-time subscription for reservation changes
  useEffect(() => {
    const channel = supabase
      .channel(`restaurant-stats-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservation',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          console.log('📊 Reservation changed — refreshing stats:', payload);
          loadData();
        },
      )
      .subscribe((status) => {
        console.log('Stats subscription status:', status);
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [restaurantId, month]);

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
              ฿{revenue.toLocaleString()}
            </Text>
          </View>
        </View>
      </BoxWrapper>
    </View>
  );
}
