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

type AuthRole = 'guest' | 'user' | 'admin';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authRole, setAuthRole] = useState<AuthRole>('guest');

  // Unified function to update auth state
  const updateAuthState = useCallback(async () => {
    const token = await TokenStorage.getAccessToken();

    if (token) {
      try {
        const decoded = jwtDecode<{ authRole?: AuthRole }>(token);
        const role = decoded.authRole || 'guest';
        setAuthRole(role);
        supabase.realtime.setAuth(token);

        // Only fetch user data if authRole is 'user', not 'admin'
        if (role === 'user') {
          const fetchedUser = await fetchCurrentUser();
          setUser(fetchedUser);
        } else {
          // Admin or guest should not have user data
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch user or decode JWT:', error);
        setUser(null);
        setAuthRole('guest');
      }
    } else {
      setUser(null);
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
        await updateAuthState(); // Re-sync Supabase auth
      } catch (error) {
        console.error('Failed to refresh token:', error);
      }
    }
  }, [updateAuthState]);

  useEffect(() => {
    // On component mount, try to refresh auth and load user
    const initializeAuth = async () => {
      setIsLoading(true);

      const ok = await refreshAuth();
      if (ok) {
        await updateAuthState();
      } else {
        await updateAuthState();
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
    // DO NOT add dependencies or else useEffect hell occurs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authApi.login(email, password);
      await updateAuthState();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      await updateAuthState();
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
