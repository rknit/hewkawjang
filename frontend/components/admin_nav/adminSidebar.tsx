import { View } from 'react-native';
import React, { useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AdminSidebarItem from './adminSidebarItem';
import { router } from 'expo-router';

interface AdminSidebarProps {
  children: React.ReactNode;
}

interface SidebarItem {
  name: string;
  icon: React.ReactNode;
  pushRoute: () => void;
}

const sidebarLayout: SidebarItem[] = [
  {
    name: 'Dashboard',
    icon: <Feather name="grid" size={24} color="black" />,
    pushRoute: () => router.push('/(admin)'),
  },
  {
    name: 'Chats',
    icon: (
      <MaterialCommunityIcons
        name="message-text-outline"
        size={24}
        color="black"
      />
    ),
    pushRoute: () => alert('Navigate to Chats'),
  },
  {
    name: 'Reviews',
    icon: (
      <MaterialCommunityIcons
        name="message-plus-outline"
        size={24}
        color="black"
      />
    ),
    pushRoute: () => alert('Navigate to Reviews'),
  },
  {
    name: 'Restaurants',
    icon: <MaterialIcons name="storefront" size={24} color="black" />,
    pushRoute: () => router.push('/(admin)/restaurants'),
  },
  {
    name: 'Support',
    icon: <MaterialIcons name="support-agent" size={24} color="black" />,
    pushRoute: () => alert('Navigate to Support'),
  },
];

export default function AdminSidebar({ children }: AdminSidebarProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleItemPress = (index: number, pushRoute: () => void) => {
    if (selectedIndex === index) return;
    setSelectedIndex(index);
    pushRoute();
  };

  return (
    <View className="flex flex-row h-full w-full">
      {/* Sidebar */}
      <View className="bg-[#EAEAEB] border-r border-[#5F5F5F] w-40 gap-y-2">
        {sidebarLayout.map((item, index) => (
          <AdminSidebarItem
            key={index}
            name={item.name}
            icon={item.icon}
            selected={selectedIndex === index}
            onPress={() => handleItemPress(index, item.pushRoute)}
          />
        ))}
      </View>

      {/* Content Area */}
      {children}
    </View>
  );
}
