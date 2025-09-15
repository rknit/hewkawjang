import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Calendar, BarChart2, Settings } from "lucide-react-native";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleStatus = () => {
    setIsOpen(!isOpen);
  };

  return (
    <View className="w-64 h-full bg-[#faf7f2] p-4 border-r border-gray-200 items-center">
      {/* Main column */}
      <View className="flex-1">
        {/* Menu items */}
        <View className="flex-col gap-6">
          {/* Restaurant Preview */}
          <TouchableOpacity className="flex-row items-center gap-3">
            <Image
              source={{ uri: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png" }}
              className="w-6 h-6"
            />
            <Text className="text-black text-base font-semibold">
              Restaurant Preview
            </Text>
          </TouchableOpacity>

          {/* Reservation */}
          <TouchableOpacity className="flex-row items-center gap-3">
            <Calendar size={28} color="black" />
            <Text className="text-black text-base font-semibold">Reservation</Text>
          </TouchableOpacity>

          {/* Dashboard */}
          <TouchableOpacity className="flex-row items-center gap-3">
            <BarChart2 size={28} color="black" />
            <Text className="text-black text-base font-semibold">Dashboard</Text>
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity className="flex-row items-center gap-3 pb-6">
            <Settings size={28} color="black" />
            <Text className="text-black text-base font-semibold">Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Footer: Status + Button */}
        <View className="mt-auto gap-2 items-center">
          <Text className={`${isOpen ? 'text-green-600' : 'text-red-600'} font-medium`}>
            Currently The restaurant is {isOpen ? 'Open' : 'Closed'}
          </Text>
          <TouchableOpacity
            onPress={toggleStatus}
            className={`px-6 py-2 rounded-md items-center ${isOpen ? 'bg-red-500' : 'bg-green-500'}`}>
    <Text className="text-white font-semibold">
    {isOpen ? 'Close Restaurant' : 'Open Restaurant'}
    </Text>
    </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}