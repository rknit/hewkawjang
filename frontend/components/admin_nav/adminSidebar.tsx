import { View } from 'react-native';
import React from 'react';
import { router, usePathname } from 'expo-router';
import type { Href } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AdminSidebarItem from './adminSidebarItem';

interface AdminSidebarProps {
  children: React.ReactNode;
}

interface SidebarItem {
  name: string;
  icon: React.ReactNode;
  route: Href;
}

const sidebarLayout: SidebarItem[] = [
  {
    name: 'Dashboard',
    icon: <Feather name="grid" size={24} color="black" />,
    route: '/',
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
    route: '/chats',
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
    route: '/reviews',
  },
  {
    name: 'Restaurants',
    icon: <MaterialIcons name="storefront" size={24} color="black" />,
    route: '/restaurants',
  },
  {
    name: 'Support',
    icon: <MaterialIcons name="support-agent" size={24} color="black" />,
    route: '/support',
  },
];

export default function AdminSidebar({ children }: AdminSidebarProps) {
  const pathname = usePathname();

  const handleItemPress = (route: Href) => {
    if (pathname === route) return; // Do nothing if already on the route
    router.push(route);
  };

  return (
    <View className="flex flex-row h-full w-full">
      {/* Sidebar */}
      <View className="bg-[#EAEAEB] border-r border-[#5F5F5F] w-40 gap-y-2 py-4">
        {sidebarLayout.map((item, index) => (
          <AdminSidebarItem
            key={index}
            name={item.name}
            icon={item.icon}
            selected={pathname === item.route}
            onPress={() => handleItemPress(item.route)}
          />
        ))}
      </View>

      {/* Content Area */}
      {children}
    </View>
  );
}
