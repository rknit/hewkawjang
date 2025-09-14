import { View, TouchableOpacity, Image, Modal } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import UnderlinedPressableText from './underlined-pressable-text';
import { useProfile } from '@/hooks/useProfile';
import { router } from 'expo-router';
import { useState } from 'react';
import UserDropdown from './accoutDropdown';

export default function NavBarUser() {
  const { user } = useProfile();
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  // Get display name with fallback
  const displayName = user?.displayName || user?.firstName || 'Loading...';

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  return (
    <View className="flex-row items-center bg-[#FEF9F3] border-b border-[#E05910] h-16 space-x-5 pr-6">
      {/* Logo on the left edge */}
      <TouchableOpacity onPress={() => router.push('/')}>
        <Image
          source={require('../assets/images/logo.png')}
          style={{ width: 64, height: 64, marginLeft: 15, marginBottom: 1 }}
        />
      </TouchableOpacity>

      <View>
        <TouchableOpacity className="flex flex-row items-center">
          <Feather name="bell" size={24} color="black" className="ml-1 mr-1" />
          <UnderlinedPressableText
            text="Notification"
            onPress={() => {
              // TODO: Navigate to notifications page
              console.log('Navigate to Notifications');
            }}
            textClassName="text-black text-base"
          />
        </TouchableOpacity>
      </View>

      <View>
        <UnderlinedPressableText
          text="My Reservation"
          onPress={() => {
            // TODO: Navigate to reservations page
            alert('Navigate to My Reservation');
          }}
          textClassName="text-black text-base"
        />
      </View>

      {/* Spacer to push links to the right */}
      <View className="flex-1" />

      {/* Navigation links on the right */}
      <View>
        {/* FIXME: Add Link to Clickon*/}
        <TouchableOpacity>
          <Feather name="message-circle" size={24} color="black" />
        </TouchableOpacity>
      </View>

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

      {/* Modal for the user dropdown */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isDropdownVisible}
        onRequestClose={toggleDropdown}
      >
        {/* Backdrop to dismiss modal */}
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          activeOpacity={1}
          onPressOut={toggleDropdown}
        >
          {/* Dropdown container - positioned absolutely */}
          <View style={{ position: 'absolute', top: 55, right: 20 }}>
            <UserDropdown />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}