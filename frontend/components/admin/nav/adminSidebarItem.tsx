import { View, Text, TouchableOpacity } from 'react-native';

interface AdminSidebarItemProps {
  name: string;
  icon: React.ReactNode;
  selected: boolean;
  onPress: () => void;
  pendingCount?: number;
}

export default function AdminSidebarItem({
  name,
  icon,
  selected,
  onPress,
  pendingCount,
}: AdminSidebarItemProps) {
  return (
    <TouchableOpacity
      className="w-full h-12 flex-row items-center justify-between pr-2"
      onPress={onPress}
    >
      <View className="items-center h-full flex-row gap-x-4">
        {/* selected sidebar item thingy */}
        {selected ? (
          <View className="w-1.5 h-full bg-[#E05910]" />
        ) : (
          <View className="w-1.5 h-full" />
        )}

        <View className="flex-row items-center gap-x-2">
          {icon}
          <Text className="font-bold text-sm">{name}</Text>
        </View>
      </View>

      {/* pending reports bubble with count */}
      {pendingCount !== undefined && pendingCount > 0 && (
        <View className="bg-[#EF4C4C] rounded-full min-w-[20px] h-[20px] px-1 items-center justify-center">
          <Text className="text-white text-xs">
            {pendingCount > 99 ? '99+' : pendingCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
