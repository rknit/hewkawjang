import { View, Text, TouchableOpacity } from 'react-native';

interface AdminSidebarItemProps {
  name: string;
  icon: React.ReactNode;
  selected: boolean;
  onPress: () => void;
}

export default function AdminSidebarItem({
  name,
  icon,
  selected,
  onPress,
}: AdminSidebarItemProps) {
  return (
    <TouchableOpacity
      className="w-full h-12 items-center flex-row gap-x-3"
      onPress={onPress}
    >
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
    </TouchableOpacity>
  );
}
