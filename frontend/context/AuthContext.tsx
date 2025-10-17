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
import { isJwtTokenExpired } from '@/utils/jwt';
import TokenStorage from '@/services/token-storage.service';

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

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const loggedIn = await TokenStorage.getAccessToken().then((t) =>
        t ? !isJwtTokenExpired(t) : false,
      );

      const hasUnexpiredRefreshToken =
        await TokenStorage.getRefreshToken().then((t) =>
          t ? !isJwtTokenExpired(t) : false,
        );

      // If logged in or has a valid refresh token, fetch user data
      if (loggedIn || hasUnexpiredRefreshToken) {
        const userData = await fetchCurrentUser();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    await authApi.login(email, password);
    // After login, fetch the user data
    // Supabase will automatically use the new JWT via the accessToken callback
    await loadUser();
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    // Supabase will automatically clear auth when TokenStorage returns null
  };

  useEffect(() => {
    loadUser();
  }, [loadUser]);

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
