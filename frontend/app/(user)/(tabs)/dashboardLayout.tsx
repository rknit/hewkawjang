import React, { useState } from 'react';
import SideBar from '@/components/restaurant-sidebar';
import { View, Text } from 'react-native';
import Dashboard from '@/components/dashboard_layout/dashboard';
import Reservation from '@/components/dashboard_layout/reservation';
import RestaurantPreview from '@/components/dashboard_layout/RestaurantPreview';
import RestaurantEdit from '@/components/restaurantEdit';
import { useLocalSearchParams } from 'expo-router';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardLayout() {
  const params = useLocalSearchParams<{ restaurantId: string }>();
  const restaurantId = Number(params.restaurantId);

  const [content, setContent] = useState('dashboard');
  const [previousContent, setPreviousContent] = useState('dashboard');

  const handleSetContent = (newContent: string) => {
    if (newContent === content) {
      // Toggle back to previous content
      setContent(previousContent);
    } else {
      setPreviousContent(content);
      setContent(newContent);
    }
  };

  const handlePreviewExit = () => {
    setContent(previousContent);
  };

  return (
    <ProtectedRoute>
      <View className="flex flex-row bg-neutral-100 h-screen w-screen overflow-auto">
        <SideBar
          restaurantId={restaurantId}
          content={content}
          setContent={handleSetContent}
        />
        <View className="w-full flex-1">
          {content === 'preview' && (
            <RestaurantPreview
              restaurantId={restaurantId}
              onExit={handlePreviewExit}
            />
          )}
          {content === 'reservation' && (
            <Reservation restaurantId={restaurantId} />
          )}
          {content === 'dashboard' && <Dashboard restaurantId={restaurantId} />}
          {content === 'settings' && (
            <RestaurantEdit restaurantId={restaurantId} />
          )}
        </View>
      </View>
    </ProtectedRoute>
  );
}
