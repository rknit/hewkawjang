import * as SecureStore from 'expo-secure-store';
import { clientType } from '@/services/api';

export default class TokenStorage {
  static async getAccessToken(): Promise<string | null> {
    switch (clientType) {
      case 'web':
        return localStorage.getItem('accessToken');
      case 'mobile':
        return await SecureStore.getItemAsync('accessToken');
      default:
        throw new Error('Unknown client type');
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    switch (clientType) {
      case 'web':
        return null;
      case 'mobile':
        return await SecureStore.getItemAsync('accessToken');
      default:
        throw new Error('Unknown client type');
    }
  }

  static async setAccessToken(token: string): Promise<void> {
    switch (clientType) {
      case 'web':
        localStorage.setItem('accessToken', token);
        return;
      case 'mobile':
        await SecureStore.setItemAsync('accessToken', token);
        return;
      default:
        throw new Error('Unknown client type');
    }
  }

  static async setRefreshToken(token: string): Promise<void> {
    switch (clientType) {
      case 'web':
        return; // Not used on web, refresh via cookies
      case 'mobile':
        await SecureStore.setItemAsync('refreshToken', token);
        return;
      default:
        throw new Error('Unknown client type');
    }
  }
}
