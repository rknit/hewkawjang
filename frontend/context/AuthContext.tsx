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
  authRole: AuthRole;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export type AuthRole = 'guest' | 'user' | 'admin';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authRole, setAuthRole] = useState<AuthRole>('guest');

  // Unified function to update auth state
  const updateAuthState = useCallback(async (userData: User | null) => {
    setUser(userData);

    const token = await TokenStorage.getAccessToken();
    if (token) {
      supabase.realtime.setAuth(token);

      try {
        const decoded = jwtDecode<{ authRole?: AuthRole }>(token);
        setAuthRole(decoded.authRole || 'user'); // Default to 'user' if not specified
      } catch (error) {
        console.error('Failed to decode JWT:', error);
        setAuthRole('user');
      }
    } else {
      supabase.realtime.setAuth(null);
      setAuthRole('guest');
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
        await updateAuthState(user); // Re-sync Supabase auth
      } catch (error) {
        console.error('Failed to refresh token:', error);
      }
    }
  }, [user, updateAuthState]);

  useEffect(() => {
    // On component mount, try to refresh auth and load user
    const initializeAuth = async () => {
      setIsLoading(true);

      const ok = await refreshAuth();
      if (ok) {
        const fetchedUser = await fetchCurrentUser();
        await updateAuthState(fetchedUser);
      } else {
        await updateAuthState(null);
      }

      setIsLoading(false);
    };

    initializeAuth();

    // Set up interval to check token expiry every 5 minutes
    const intervalId = setInterval(
      checkAndRefreshToken,
      5 * 60 * 1000, // 5 minutes in milliseconds
    );

    return () => {
      clearInterval(intervalId);
    };
  }, [updateAuthState, checkAndRefreshToken]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authApi.login(email, password);
      const fetchedUser = await fetchCurrentUser();
      await updateAuthState(fetchedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      await updateAuthState(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, authRole, isLoading, login, logout, refreshAuth }}
    >
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
