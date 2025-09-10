import axios from 'axios';
import TokenStorage from '@/services/token-storage';
import { Platform } from 'react-native';

const clientType = Platform.OS === 'web' ? 'web' : 'mobile';

const api = axios.create({
  baseURL: process.env.BACKEND_URL || 'http://localhost:8080',
  timeout: 15000,
});

const refreshApi = axios.create({
  baseURL: process.env.BACKEND_URL || 'http://localhost:8080',
  timeout: 15000,
  headers: {
    'hkj-auth-client-type': clientType,
  },
  withCredentials: true, // For cookies on web
});

// Request interceptor: attach access token
api.interceptors.request.use(async (config) => {
  const token = await TokenStorage.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 Unauthorized
api.interceptors.response.use(undefined, async (error) => {
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
      // TODO: logout user and redirect to login
      return Promise.reject(error);
    }

    // Successfully refreshed tokens, retry original request
    return api(error.config);
  }

  // TODO: handle other status codes globally if needed
  return Promise.reject(error);
});

export default api;
