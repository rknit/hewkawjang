import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user, authRole, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/');
      } else if (requireAdmin && authRole !== 'admin') {
        router.replace('/');
      }
    }
  }, [user, authRole, isLoading, requireAdmin]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#C54D0E" />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  if (requireAdmin && authRole !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
