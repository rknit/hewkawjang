import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import CenteredLoadingIndicator from './centeredLoading';

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
    return <CenteredLoadingIndicator />;
  }

  return <>{children}</>;
}
