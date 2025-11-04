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
  const { user, authRole, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && authRole === 'guest') {
      router.replace('/');
    }

    if (!isLoading && adminOnly && authRole !== 'admin') {
      router.replace('/(user)');
    }
  }, [user, authRole, isLoading, adminOnly]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#C54D0E" />
      </View>
    );
  }

  if (authRole !== 'admin' && !user) {
    return null;
  }

  return <>{children}</>;
}
