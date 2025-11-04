import { View, TouchableOpacity, Image, Text } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import UnderlinedPressableText from './underlined-pressable-text';
import { router } from 'expo-router';
import { useState, useMemo } from 'react';
import UserDropdown from './user-dropdown';
import NotificationPane from './notificationPane';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';

export default function NavBarUser() {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isNotiPaneVisible, setNotiPaneVisible] = useState(false);

  // Get display name with fallback
  const displayName = user?.displayName || user?.firstName || 'Loading...';

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const handleCloseNotiPane = () => {
    setNotiPaneVisible(false);
  };

  const unreadNotiCount = useMemo(
    () => notifications.filter((noti) => !noti.isRead).length,
    [notifications],
  );

  return (
    <View className="flex-row items-center bg-[#FEF9F3] border-b border-[#E05910] h-16 space-x-5 pr-6">
      {/* Logo on the left edge */}
      <TouchableOpacity onPress={() => router.push('/(user)')}>
        <Image
          source={require('../assets/images/logo.png')}
          style={{ width: 64, height: 64, marginLeft: 15, marginBottom: 1 }}
        />
      </TouchableOpacity>

      <View>
        <TouchableOpacity
          className="flex flex-row items-center"
          onPress={() => setNotiPaneVisible(true)}
        >
          <View className="relative">
            <Feather
              name="bell"
              size={24}
              color="black"
              className="ml-1 mr-1"
            />
            {unreadNotiCount > 0 && (
              <View className="absolute -top-1 -right-0 bg-[#EF4C4C] rounded-full w-[16px] h-[16px] items-center justify-center px-1">
                <Text className="text-white text-xs font-bold">
                  {unreadNotiCount > 99 ? '99+' : unreadNotiCount}
                </Text>
              </View>
            )}
          </View>
          <UnderlinedPressableText
            text="Notification"
            onPress={() => setNotiPaneVisible(true)}
            textClassName="text-black text-base"
          />
        </TouchableOpacity>
      </View>

      <View>
        <UnderlinedPressableText
          text="My Reservation"
          onPress={() => router.push('/UserReservationsScreen')}
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

      <UserDropdown visible={isDropdownVisible} onClose={toggleDropdown} />

      <NotificationPane
        visible={isNotiPaneVisible}
        onClose={handleCloseNotiPane}
      />
    </View>
  );
}
