import React from 'react';
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

const data = [
  { name: 'Jan', bookings: 400 },
  { name: 'Feb', bookings: 300 },
  { name: 'Mar', bookings: 500 },
  { name: 'Apr', bookings: 200 },
  { name: 'May', bookings: 600 },
  { name: 'Jun', bookings: 700 },
];

export default function BookingChart() {
  return (
    <View className="w-full mt-3 flex-1 text-xs h-64">
      <ResponsiveContainer width="100%" height="100%">
        {/* Add your chart component here, e.g. <BarChart ... /> */}

        <BarChart
          width={500}
          height={300}
          data={data}
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
