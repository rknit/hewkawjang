import { View } from 'react-native';
import React from 'react';
import { router, usePathname } from 'expo-router';
import type { Href } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AdminSidebarItem from './adminSidebarItem';
import { Report } from '@/types/report.type';
import { useAdmin } from '@/context/AdminContext';
import { Restaurant } from '@/types/restaurant.type';

interface AdminSidebarProps {
  children: React.ReactNode;
}

interface SidebarItem {
  name: string;
  icon: React.ReactNode;
  route: Href;
  getPendingCount?: (reports: Report[], restaurants?: Restaurant[]) => number;
}

const sidebarLayout: SidebarItem[] = [
  {
    name: 'Chats',
    icon: (
      <MaterialCommunityIcons
        name="message-text-outline"
        size={24}
        color="black"
      />
    ),
    route: '/',
    getPendingCount: (reports) =>
      reports.filter((r) => r.reportType === 'chat').length,
  },
  {
    name: 'Messages',
    icon: (
      <MaterialCommunityIcons name="email-outline" size={24} color="black" />
    ),
    route: '/messages',
    getPendingCount: (reports) =>
      reports.filter((r) => r.reportType === 'message' && !r.isSolved).length,
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
    getPendingCount: (reports) =>
      reports.filter((r) => r.reportType === 'review').length,
  },
  {
    name: 'Restaurants',
    icon: <MaterialIcons name="storefront" size={24} color="black" />,
    route: '/restaurants',
    getPendingCount: (reports, restaurants) =>
      reports.filter((r) => r.reportType === 'restaurant').length +
      (restaurants?.length ?? 0),
  },
];

export default function AdminSidebar({ children }: AdminSidebarProps) {
  const { pendingReports, pendingRestaurants } = useAdmin();
  const pathname = usePathname();

  const handleItemPress = (route: Href) => {
    if (pathname === route) return; // Do nothing if already on the route
    router.push(route);
  };

  return (
    <View className="flex flex-row flex-1">
      {/* Sidebar */}
      <View className="bg-[#EAEAEB] border-r border-[#5F5F5F] w-48 gap-y-2 py-4">
        {sidebarLayout.map((item, index) => (
          <AdminSidebarItem
            key={index}
            name={item.name}
            icon={item.icon}
            selected={pathname === item.route}
            onPress={() => handleItemPress(item.route)}
            pendingCount={
              item.name === 'Restaurants'
                ? item.getPendingCount?.(pendingReports, pendingRestaurants)
                : item.getPendingCount?.(pendingReports)
            }
          />
        ))}
      </View>

      {/* Content Area */}
      {children}
    </View>
  );
}
