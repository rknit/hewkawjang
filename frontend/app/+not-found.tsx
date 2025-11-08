import { router } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';

export default function NotFound() {
  return (
    <View className="flex flex-col items-center justify-center h-full py-10 gap-y-8">
      <View className="items-center gap-y-4">
        <Text className="text-4xl text-[#161616] font-bold">
          404 - Page Not Found
        </Text>
        <Text className="text-lg text-[#E05910]">
          Oops! The page you are looking for does not exist.
        </Text>
      </View>

      <TouchableOpacity
        className="bg-[#E05910] justify-center items-center px-4 py-3 rounded-lg"
        onPress={() => router.push('/')}
      >
        <Text className="text-white font-bold text-sm">
          Return to Main Page
        </Text>
      </TouchableOpacity>
    </View>
  );
}
