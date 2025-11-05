import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Admin } from '@/types/admin.type';
import { fetchCurrentAdmin } from '@/apis/admin.api';

export function useAdmin() {
  const { authRole } = useAuth();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadAdmin = useCallback(async () => {
    if (authRole === 'admin') {
      setIsLoading(true);
      try {
        const fetchedAdmin = await fetchCurrentAdmin();
        setAdmin(fetchedAdmin);
      } catch (error) {
        console.error('Failed to fetch admin:', error);
        setAdmin(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      setAdmin(null);
      setIsLoading(false);
    }
  }, [authRole]);

  useEffect(() => {
    loadAdmin();
  }, [loadAdmin]);

  const refetch = useCallback(() => {
    return loadAdmin();
  }, [loadAdmin]);

  return { admin, isLoading, refetch };
}
