import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({
  children,
  adminOnly,
}: ProtectedRouteProps) {
  const { authRole, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (authRole === 'guest') {
      router.replace('/');
    }

    if (adminOnly && authRole !== 'admin') {
      router.replace('/(user)');
    }
  }, [authRole, isLoading, adminOnly]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#C54D0E" />
      </View>
    );
  }

  return <>{children}</>;
}
