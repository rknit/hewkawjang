import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Link } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';

export default function NavBarUser() {
  return (
    <View className="flex-row items-center bg-[#FEF9F3] border-b border-[#E05910] h-16 space-x-5 pr-6">
      {/* Logo on the left edge */}
      <Image
        source={require('../assets/images/logo.png')}
        style={{ width: 64, height: 64, marginLeft: 15 }}
      />

      <View>
        <TouchableOpacity className="flex flex-row items-center">
          <Feather name="bell" size={24} color="black" className="ml-1 mr-1" />
          <Text className="text-base">Notification</Text>
        </TouchableOpacity>
      </View>

      <View>
        <TouchableOpacity>
          <Text className="text-base">My Reservation</Text>
        </TouchableOpacity>
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

      <View className="flex flex-row items-center">
        <Text className="text-base mr-2">Boonchai</Text>
        <Feather name="user" size={24} color="black" />
      </View>
    </View>
  );
}
