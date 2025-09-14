import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { logout } from '@/apis/auth.api';

export default function UserDropdown() {
  return (
    <View className="w-64 bg-white border rounded boxShadow-lg z-50">
      <View className="p-4 border-b">
        <Text className="font-semibold">Boonchai Jinaporn</Text>
        <Text className="text-sm text-gray-500">boonchai1315@gmail.com</Text>
      </View>
      <View className="flex flex-col p-2">
        <TouchableOpacity className="flex-row items-center gap-2 p-2 rounded hover:bg-gray-100">
          <Feather name="user" size={16} color="black" />
          <Text>My profile</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center gap-2 p-2 rounded hover:bg-gray-100">
          {/* Using MaterialCommunityIcons for the store icon */}
          <MaterialCommunityIcons name="storefront" size={16} color="black" />
          <Text>Sign up for restaurant</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center gap-2 p-2 rounded hover:bg-gray-100">
          <MaterialCommunityIcons name="headphones" size={16} color="black" />
          <Text>Contact support</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center gap-2 p-2 rounded hover:bg-gray-100">
          <MaterialCommunityIcons name="wallet" size={16} color="black" />
          <Text>My wallet : 2,000.00 ฿</Text>
        </TouchableOpacity>
      </View>
      <View className="border-t p-2">
        <TouchableOpacity className="flex-row items-center gap-2 p-2 rounded w-full" onPress={logout}>
          <Feather name="log-out" size={16} color="black" />
          <Text>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
