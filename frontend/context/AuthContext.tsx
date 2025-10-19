import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { User } from '@/types/user.type';
import { fetchCurrentUser } from '@/apis/user.api';
import * as authApi from '@/apis/auth.api';
import { refreshAuth } from '@/services/api.service';
import TokenStorage from '@/services/token-storage.service';
import { isJwtTokenExpiringSoon } from '@/utils/jwt';
import { supabase } from '@/utils/supabase';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const updateSupabaseRealtimeAuth = useCallback(async () => {
    const token = await TokenStorage.getAccessToken();
    if (token) {
      supabase.realtime.setAuth(token);
    } else {
      supabase.realtime.setAuth(null);
    }
  }, []);

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await fetchCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkAndRefreshToken = useCallback(async () => {
    const token = await TokenStorage.getAccessToken();
    if (!token) return;

    // Check if token expires in less than 2 minutes (120 seconds)
    const nearlyExpired = isJwtTokenExpiringSoon(token, 120);
    if (nearlyExpired) {
      console.log('Token nearly expired, refreshing...');
      try {
        await refreshAuth();
        // Update Supabase realtime auth after token refresh
        await updateSupabaseRealtimeAuth();
      } catch (error) {
        console.error('Failed to refresh token:', error);
      }
    }
  }, [updateSupabaseRealtimeAuth]);

  useEffect(() => {
    // On component mount, try to refresh auth and load user
    refreshAuth().then(async () => {
      await loadUser();
      // Update Supabase realtime auth with the current access token
      await updateSupabaseRealtimeAuth();
    });

    // Set up interval to check token expiry every 5 minutes
    const intervalId = setInterval(
      () => {
        checkAndRefreshToken();
      },
      5 * 60 * 1000, // 5 minutes in milliseconds
    );

    return () => {
      clearInterval(intervalId);
    };
  }, [loadUser, checkAndRefreshToken, updateSupabaseRealtimeAuth]);

  const login = async (email: string, password: string) => {
    await authApi.login(email, password);
    // After login, fetch the user data
    await loadUser();
    // Update Supabase realtime auth with the new access token
    await updateSupabaseRealtimeAuth();
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    // Clear Supabase realtime auth when logging out
    await updateSupabaseRealtimeAuth();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
