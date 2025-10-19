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

export function isJwtTokenExpiringSoon(
  token: string,
  thresholdSeconds: number = 120,
): boolean {
  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    if (!decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - currentTime;

    return timeUntilExpiry < thresholdSeconds;
  } catch (error) {
    if (__DEV__) {
      console.error('Error checking JWT expiry:', error);
    }
    return true;
  }
}
