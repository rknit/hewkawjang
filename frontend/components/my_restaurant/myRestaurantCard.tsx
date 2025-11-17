import React from 'react';
import { View, Text, Image, TouchableOpacity, Pressable } from 'react-native';
import { updateRestaurantStatus } from '@/apis/restaurant.api';
import { router } from 'expo-router';
import { MyRestaurantEntry } from '@/app/(user)/(tabs)/myRestaurant';
import StarRating from '../starRating';

type MyRestaurantCardProps = {
  entry: MyRestaurantEntry;
  onToggleStatus?: (newStatus: 'open' | 'closed') => void;
};

export default function MyRestaurantCard({
  entry,
  onToggleStatus,
}: MyRestaurantCardProps) {
  const fallbackImgUrl =
    'https://uhrpfnyjcvpwoaioviih.supabase.co/storage/v1/object/public/test/photo-1517248135467-4c7edcad34c4.jpg';

  const [isOpen, setIsOpen] = React.useState(
    entry.restaurant.status === 'open',
  );

  const onDashboard = () => {
    router.push(`/dashboardLayout?restaurantId=${entry.restaurant.id}`);
  };

  const handleToggleStatus = async () => {
    const newStatus = isOpen ? 'closed' : 'open';
    await updateRestaurantStatus(entry.restaurant.id, newStatus);
    setIsOpen(!isOpen);
    onToggleStatus?.(newStatus);
  };

  return (
    <Pressable
      onPress={onDashboard}
      className="bg-[#FEF9F3] border border-[#E05910] rounded-lg"
    >
      <Image
        source={{
          uri: entry.restaurant.images?.[0] ?? fallbackImgUrl,
        }}
        className="rounded-lg rounded-b-none"
        style={{ width: 393, height: 240 }}
        resizeMode="cover"
      />

      <View className="flex-col p-4 gap-2">
        <Text className="text-base font-semibold underline">
          {entry.restaurant.name}
        </Text>
        <View className="flex-row justify-between">
          {/* info */}
          <View className="flex-col">
            <View className="flex-row items-center gap-2 mb-2">
              <StarRating rating={entry.averageRating} />
              <Text>{entry.averageRating}</Text>
            </View>

            <Text className="text-xs text-[#808080]">
              Today Reservations: {entry.reservationCount}
            </Text>

            <Text className="text-xs text-[#808080]">
              Pending Reservations: {entry.pendingReservations}
            </Text>

            <Text className="text-xs text-[#808080]">
              {entry.restaurant.cuisineType} • {entry.restaurant.district}
            </Text>
          </View>

          {/* open/close button/status */}
          <View className="flex-col items-center gap-2 justify-end">
            <View className="border-[#E05910] border-2 rounded-full p-1">
              <Text className="text-xs text-[#E05910]">
                {isOpen ? 'Status: Open' : 'Status: Closed'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleToggleStatus}
              className={`px-3 py-1 rounded ${
                !isOpen ? 'bg-green-500' : 'bg-red-500'
              } ml-auto w-32 h-8 items-center justify-center`}
            >
              <Text className="text-white text-xs font-semibold">
                {!isOpen ? 'Open Restaurant' : 'Close Restaurant'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
