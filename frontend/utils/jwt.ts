import { jwtDecode } from 'jwt-decode';

export function isJwtTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    if (!exp) {
      return true;
    }
    return exp < currentTime;
  } catch (error) {
    if (__DEV__) {
      console.error('Error decoding JWT:', error);
    }
    return true;
  }
}
