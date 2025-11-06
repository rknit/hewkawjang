import { Restaurant } from '@/types/restaurant.type';
import { View, Text, Image, TouchableOpacity, Pressable } from 'react-native';

interface AdminRestaurantCardProps {
  restaurant: Restaurant;
  onPressCard: () => void;

  mainActionLabel: string;
  onPressMainAction: () => void;

  subActionLabel: string;
  onPressSubAction: () => void;

  statusLabel: string;
}

export default function AdminRestaurantCard({
  restaurant,
  onPressCard,
  mainActionLabel,
  onPressMainAction,
  subActionLabel,
  onPressSubAction,
  statusLabel,
}: AdminRestaurantCardProps) {
  const fallbackImgUrl =
    'https://uhrpfnyjcvpwoaioviih.supabase.co/storage/v1/object/public/test/photo-1517248135467-4c7edcad34c4.jpg';
  const tags = [restaurant.cuisineType, restaurant.district];

  return (
    <Pressable
      className="border border-[#E0E0E0] w-full h-28 mb-4 rounded-lg justify-between flex-row p-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
      }}
      onPress={onPressCard}
    >
      {/* Left info */}
      <View className="flex-row gap-4 h-full">
        <Image
          source={{ uri: restaurant.images?.[0] || fallbackImgUrl }}
          className="w-28 h-full rounded-md"
          resizeMode="cover"
        />

        <View className="flex-col mt-1 gap-y-2">
          <Text className="text-sm">{restaurant.name}</Text>

          <View className="flex-row gap-x-4">
            {tags.map((tag, index) => (
              <Text key={index} className="text-xs text-[#5F5F5F]">
                {tag}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* Right Actions */}
      <View className="flex-col h-full items-end justify-around mt-2">
        <View className="items-center flex-col gap-y-1">
          <TouchableOpacity
            className="w-20 h-8 bg-[#E05910] justify-center items-center py-2 rounded-md"
            onPress={onPressMainAction}
          >
            <Text className="text-white font-bold text-xs">
              {mainActionLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onPressSubAction}>
            <Text className="text-[#5F5F5F] text-xs underline">
              {subActionLabel}
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-[#5F5F5F] text-[0.6rem]">{statusLabel}</Text>
      </View>
    </Pressable>
  );
}
