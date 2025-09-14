// index.tsx
import RestaurantDashboard from '@/components/reservation-table';
import RestaurantCard from '@/components/restaurantCard';
import { View, ScrollView } from 'react-native';

export default function Index() {
  const restaurants = [
    {
      name: 'Pagoda Chinese Restaurant',
      address: "@ Bangkok Marriott Marquis Queen's Park",
      tags: ['Phrom Phong', 'Chinese Cuisine'],
      rating: 4.5,
      prices: 5,
    },
    {
      name: 'Barcelona Gaudi',
      address: 'Asok • European',
      tags: ['Asok', 'European'],
      rating: 4.5,
      prices: 5,
    },
    {
      name: 'BARSUI @ Sheraton Grande Sukhumvit Hotel',
      address: 'Asok • Bars and pubs',
      tags: ['Asok', 'Bars and pubs'],
      rating: 4.4,
      prices: 5,
    },
    {
      name: 'Great Harbour International Buffet @ ICONSIAM',
      address: 'Charoen Nakhon • Buffet',
      tags: ['Charoen Nakhon', 'Buffet'],
      rating: 4.5,
      prices: 5,
      isNew: true,
    },
  ];

  return (
    <View className="flex-1 bg-gray-100">
      <RestaurantDashboard />
    </View>
  );
}
