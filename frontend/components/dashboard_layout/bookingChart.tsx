import { fetchReservationsByRestaurantInOneMonth } from '@/apis/reservation.api';
import { supabase } from '@/utils/supabase';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'; // Make sure recharts is installed

interface BookingChartProps {
  restaurantId: number;
  month: number;
}
// Sample static data for the chart
/*
const data = [
  { name: 'Jan', bookings: 400 },
  { name: 'Feb', bookings: 300 },
  { name: 'Mar', bookings: 500 },
  { name: 'Apr', bookings: 200 },
  { name: 'May', bookings: 600 },
  { name: 'Jun', bookings: 700 },
];
*/
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

    // Example aggregation by day (or by week)
    const grouped = groupByDay(reservations);
    setReservations(grouped);
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
      // Call removeChannel but don't return the Promise to React's cleanup
      void supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  return (
    <View className="w-full mt-3 flex-1 text-xs h-64">
      <ResponsiveContainer width="100%" height="100%">
        {/* Add your chart component here, e.g. <BarChart ... /> */}

        <BarChart
          width={500}
          height={300}
          data={reservations}
          margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />s
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="bookings" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </View>
  );
}

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
