import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AuthService from './auth.service';

const clientType = Platform.OS === 'web' ? 'web' : 'mobile';

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
        AuthService.notifyAuthChange();
        return;
      case 'mobile':
        await SecureStore.setItemAsync('accessToken', token);
        AuthService.notifyAuthChange();
        return;
      default:
        throw new Error('Unknown client type');
    }
  }

  static async setRefreshToken(token: string): Promise<void> {
    switch (clientType) {
      case 'web':
        AuthService.notifyAuthChange();
        return; // Not used on web, refresh via cookies
      case 'mobile':
        await SecureStore.setItemAsync('refreshToken', token);
        AuthService.notifyAuthChange();
        return;
      default:
        throw new Error('Unknown client type');
    }
  }

  static async removeAccessToken(): Promise<void> {
    switch (clientType) {
      case 'web':
        localStorage.removeItem('accessToken');
        AuthService.notifyAuthChange();
        return;
      case 'mobile':
        await SecureStore.deleteItemAsync('accessToken');
        AuthService.notifyAuthChange();
        return;
      default:
        throw new Error('Unknown client type');
    }
  }

  static async removeRefreshToken(): Promise<void> {
    switch (clientType) {
      case 'web':
        AuthService.notifyAuthChange();
        return; // Refresh token handled via HttpOnly cookie
      case 'mobile':
        await SecureStore.deleteItemAsync('refreshToken');
        AuthService.notifyAuthChange();
        return;
      default:
        throw new Error('Unknown client type');
    }
  }
}
