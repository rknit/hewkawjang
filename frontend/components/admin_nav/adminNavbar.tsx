import { View, TouchableOpacity, Image, Text } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import UnderlinedPressableText from '../underlined-pressable-text';
import { router } from 'expo-router';
import { useState } from 'react';
import AdminDropdown from './adminDropdown';

export default function AdminNavbar() {
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  // Get display name with fallback
  // TODO: admin display name
  const displayName = 'Admin McAdminface';

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  return (
    <View className="flex-row items-center bg-[#E4E2E4] border-b border-[#252422] h-16 space-x-5 pr-6">
      {/* Logo on the left edge */}
      <TouchableOpacity onPress={() => router.push('/(admin)')}>
        <Image
          source={require('@/assets/images/logo-admin.png')}
          style={{ width: 64, height: 64, marginLeft: 15, marginBottom: 1 }}
        />
      </TouchableOpacity>

      <Text className="font-bold text-[#2B2B2B] items-center text-xl">
        HewKawJang
      </Text>

      {/* Spacer to push links to the right */}
      <View className="flex-1" />

      {/* Profile section with dropdown trigger */}
      <View className="flex flex-row items-center">
        <UnderlinedPressableText
          text={displayName}
          onPress={toggleDropdown} // Use the toggle function
          textClassName="text-black text-base mr-2"
        />
        <TouchableOpacity onPress={toggleDropdown}>
          <Feather name="user" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <AdminDropdown visible={isDropdownVisible} onClose={toggleDropdown} />
    </View>
  );
}
