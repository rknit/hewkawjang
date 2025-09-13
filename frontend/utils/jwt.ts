import TokenStorage from '@/services/token-storage.service';
import { jwtDecode } from 'jwt-decode';

export async function isUserLoggedIn(): Promise<boolean> {
  const token = await TokenStorage.getAccessToken();
  if (!token) {
    return false;
  }

  try {
    const { exp } = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    if (!exp) {
      return false;
    }
    return exp > currentTime;
  } catch (error) {
    if (__DEV__) {
      console.error('Error decoding JWT:', error);
    }
    return false;
  }
}
