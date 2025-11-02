import { fetchReservationsByRestaurantInOneMonth } from '@/apis/reservation.api';
import { supabase } from '@/utils/supabase';
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface BookingChartProps {
  restaurantId: number;
  month: number;
}

export default function BookingChart({
  restaurantId,
  month,
}: BookingChartProps) {
  const [reservations, setReservations] = React.useState<any[]>([]);
  const now = new Date();
  const year = now.getFullYear();

  const loadData = async () => {
    const reservations = await fetchReservationsByRestaurantInOneMonth(
      restaurantId,
      month,
      year,
    );

    if (!reservations) return;

    const grouped = groupByDay(reservations);
    setReservations(grouped);
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
          table: 'reservations',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          console.log('Database changed — refreshing chart');
          loadData();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  return (
    <View className="w-full mt-3 h-72 bg-white rounded-2xl shadow-md border border-orange-100 p-3">
      <Text className="text-base font-semibold text-gray-800 mb-2 text-center">
        Reservations per Day
      </Text>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={reservations}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#FDE68A" />
          <XAxis dataKey="name" stroke="#FB923C" />
          <YAxis stroke="#FB923C" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFF7ED',
              borderColor: '#FDBA74',
              borderRadius: 8,
            }}
          />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <Bar
            dataKey="bookings"
            fill="url(#orangeGradient)"
            radius={[8, 8, 0, 0]}
            name="Bookings"
          />
          <defs>
            <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FB923C" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#FDBA74" stopOpacity={0.7} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </View>
  );
}

// Helper function — group reservations by day
function groupByDay(reservations: any[]) {
  const map = new Map<string, number>();

  for (const r of reservations) {
    const date = new Date(r.reserveAt);
    const day = date.getDate().toString();
    map.set(day, (map.get(day) || 0) + 1);
  }

  return Array.from(map.entries()).map(([day, count]) => ({
    name: `Day ${day}`,
    bookings: count,
  }));
}
