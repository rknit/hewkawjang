import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Link } from '@react-navigation/native';

export default function NavBarGuest() {
  return (
    <View className="flex-row items-center bg-[#FEF9F3] border-b border-[#E05910] h-16">
      {/* Logo on the left edge */}
      <Image
        source={require('../assets/images/logo.png')}
        style={{ width: 64, height: 64, marginLeft: 15 }}
      />

      {/* Spacer to push links to the right */}
      <View className="flex-1" />

      {/* Navigation links on the right */}
      <View className="flex-row space-x-6 pr-6">
        {/* FIXME: Add Link to Clickon*/}
        <TouchableOpacity>
          <Text className="text-black    text-base">Login/Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
