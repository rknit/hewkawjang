import axios from 'axios';
import TokenStorage from '@/services/token-storage.service';
import { Platform } from 'react-native';
import { router } from 'expo-router';

const clientType = Platform.OS === 'web' ? 'web' : 'mobile';

const ApiService = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080',
  timeout: 15000,
});

const refreshApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080',
  timeout: 15000,
  headers: {
    'hkj-auth-client-type': clientType,
  },
  withCredentials: true, // For cookies on web
});

// Request interceptor: attach access token
ApiService.interceptors.request.use(async (config) => {
  const token = await TokenStorage.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 Unauthorized
ApiService.interceptors.response.use(undefined, async (error) => {
  if (error.response?.status === 401) {
    const token = await TokenStorage.getRefreshToken();

    // Attempt to refresh token
    const resp = await refreshApi.post('/auth/refresh', undefined, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '', // Attach refresh token if available
      },
    });

    if (resp.status === 200) {
      const newAccessToken = resp.data.accessToken;
      const newRefreshToken = resp.data.refreshToken;

      // Store new tokens
      await Promise.all([
        TokenStorage.setAccessToken(newAccessToken),
        TokenStorage.setRefreshToken(newRefreshToken),
      ]);
    } else {
      await Promise.all([
        TokenStorage.removeAccessToken(),
        TokenStorage.removeRefreshToken(),
      ]);
      router.replace('/');
      return Promise.reject(new Error('Unable to refresh token'));
    }

    // Successfully refreshed tokens, retry original request
    return ApiService(error.config);
  }

  // TODO: handle other status codes globally if needed
  return Promise.reject(error);
});

export default ApiService;
