import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/types/user.type';
import { fetchCurrentUser } from '@/apis/user.api';

export function useUser() {
  const { authRole } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadUser = useCallback(async () => {
    if (authRole === 'user') {
      setIsLoading(true);
      try {
        const fetchedUser = await fetchCurrentUser();
        setUser(fetchedUser);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [authRole]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const refetch = useCallback(() => {
    return loadUser();
  }, [loadUser]);

  return { user, isLoading, refetch };
}
