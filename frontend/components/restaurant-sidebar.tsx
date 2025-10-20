import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Calendar, BarChart2, Settings } from 'lucide-react-native';
import {
  fetchRestaurantById,
  updateRestaurantStatus,
} from '@/apis/restaurant.api';

interface SidebarProps {
  restaurantId: number;
  content: string;
  setContent: (content: string) => void;
}

export default function Sidebar({
  restaurantId,
  content,
  setContent,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSetting, setIsSetting] = useState(false);
  const [isDashboard, setIsDashboard] = useState(false);
  const [isReservation, setIsReservation] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    setIsSetting(content === 'settings');
    setIsDashboard(content === 'dashboard');
    setIsReservation(content === 'reservation');
    setIsPreview(content === 'preview');
  }, [content]);

  useEffect(() => {
    const fetchStatus = async () => {
      const restaurant = await fetchRestaurantById(restaurantId);
      setIsOpen(restaurant ? restaurant.status === 'open' : false);
    };
    fetchStatus();
  }, [restaurantId]);

  const toggleStatus = async () => {
    await updateRestaurantStatus(restaurantId, isOpen ? 'closed' : 'open');
    setIsOpen(!isOpen);
  };

  const setStates = (i: number) => {
    if (i === 1) {
      setIsSetting(false);
      setIsDashboard(false);
      setIsReservation(false);
      setIsPreview(true);
      setContent('preview');
    }
    if (i === 2) {
      setIsSetting(false);
      setIsDashboard(false);
      setIsPreview(false);
      setIsReservation(true);
      setContent('reservation');
    }
    if (i === 3) {
      setIsSetting(false);
      setIsReservation(false);
      setIsPreview(false);
      setIsDashboard(true);
      setContent('dashboard');
    }
    if (i === 4) {
      setIsDashboard(false);
      setIsReservation(false);
      setIsPreview(false);
      setIsSetting(true);
      setContent('settings');
    }
  };

  return (
    <View className="fix w-64 h-full bg-[#faf7f2] p-4 border-r border-gray-200 items-center">
      {/* Main column */}
      <View className="flex-1 gap-8 w-full top-5">
        {/* Menu items */}
        <View className="flex-col ">
          {/* Restaurant Preview */}
          <TouchableOpacity
            className={`${isPreview ? 'bg-orange-500' : 'bg-[#faf7f2]'}  pb-6`}
            onPress={() => setStates(1)}
          >
            <View className="flex-row top-3 center gap-3 left-3">
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
                }}
                className="w-6 h-6"
              />
              <Text
                className={`${isPreview ? 'text-white' : 'text-black'} text-base font-semibold`}
              >
                Restaurant Preview
              </Text>
            </View>
          </TouchableOpacity>

          {/* Reservation */}
          <TouchableOpacity
            className={`${isReservation ? 'bg-orange-500' : 'bg-[#faf7f2]'}  pb-6`}
            onPress={() => setStates(2)}
          >
            <View className="flex-row top-3 center gap-3 left-3">
              <Calendar
                size={28}
                color={`${isReservation ? 'white' : 'black'}`}
              />
              <Text
                className={`${isReservation ? 'text-white' : 'text-black'} text-base font-semibold`}
              >
                Reservation
              </Text>
            </View>
          </TouchableOpacity>

          {/* Dashboard */}
          <TouchableOpacity
            className={`${isDashboard ? 'bg-orange-500' : 'bg-[#faf7f2]'}  pb-6`}
            onPress={() => setStates(3)}
          >
            <View className="flex-row top-3 center gap-3 left-3">
              <BarChart2
                size={28}
                color={`${isDashboard ? 'white' : 'black'}`}
              />
              <Text
                className={`${isDashboard ? 'text-white' : 'text-black'} text-base font-semibold`}
              >
                Dashboard
              </Text>
            </View>
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            className={`${isSetting ? 'bg-orange-500' : 'bg-[#faf7f2]'}  pb-6`}
            onPress={() => setStates(4)}
          >
            <View className="flex-row top-3 center gap-3 left-3">
              <Settings size={28} color={`${isSetting ? 'white' : 'black'}`} />
              <Text
                className={`${isSetting ? 'text-white' : 'text-black'} text-base font-semibold`}
              >
                Settings
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      {/* Footer: Status + Button */}
      <View className="gap-10 items-center bottom-20">
        <Text
          className={`${isOpen ? 'text-green-600' : 'text-red-600'} font-medium`}
        >
          Currently The restaurant is {isOpen ? 'Open' : 'Closed'}
        </Text>
        <TouchableOpacity
          onPress={toggleStatus}
          className={`px-6 py-2 bottom-5 rounded-md items-center ${isOpen ? 'bg-red-500' : 'bg-green-500'}`}
        >
          <Text className="text-white font-semibold">
            {isOpen ? 'Close Restaurant' : 'Open Restaurant'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
