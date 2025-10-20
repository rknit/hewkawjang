import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Scroll } from 'lucide-react-native';
import {
  fetchOwnerRestaurants,
  fetchRestaurantById,
  updateRestaurantStatus,
} from '@/apis/restaurant.api';
import { useAuth } from '@/context/AuthContext';
import Restaurant from '@/app/(tabs)/RestaurantPreview';
import { router } from 'expo-router';
import RestaurantActivationButton from '../restaurant-activation-button';

interface MyRestaurantCardProps {
  restaurant: {
    id: number;
    name: string;
    phoneNo: string;
    cuisineType: string;
    location: string;
  };
}

export default function MyRestaurantCard({
  restaurant,
}: MyRestaurantCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const LoadData = async () => {
    try {
      const data = await fetchRestaurantById(restaurant.id);
      if (!data) return;
      setIsOpen(data.status === 'open');
    } catch (error) {
      console.error('Error fetching restaurant status:', error);
    }
  };
  useEffect(() => {
    LoadData();
  }, [restaurant.id]);

  const onDashboard = () => {
    router.push(`/dashboardLayout?restaurantId=${restaurant.id}`);
  };

  return (
    <TouchableOpacity
      onPress={() => {
        onDashboard();
      }}
      className="bg-[#FEF9F3] rounded-lg shadow p-2 flex-colunm flex-1 gap-10"
    >
      <View className="w-full">
        <Image
          source={{
            uri: 'https://th.bing.com/th/id/OIP.XY9twaWvDwJsHOwftj4V6QHaE8?w=288&h=192&c=7&r=0&o=7&cb=12&dpr=1.3&pid=1.7&rm=3',
          }}
          className="rounded-lg"
          style={{ width: '100%', height: 125 }}
          resizeMode="cover"
        />
      </View>

      <View className="flex-row justify-btween ">
        <View>
          <Text>bb</Text>
        </View>
        <View className="flex-colunm">
          <TouchableOpacity
            onPress={async () => {
              await updateRestaurantStatus(
                restaurant.id,
                isOpen ? 'closed' : 'open',
              );
              setIsOpen(!isOpen);
            }}
            className={`px-6 py-2 bottom-5 rounded-md items-center ${isOpen ? 'bg-red-500' : 'bg-green-500'}`}
          >
            <Text className="text-white font-semibold">
              {isOpen ? 'Close Restaurant' : 'Open Restaurant'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
