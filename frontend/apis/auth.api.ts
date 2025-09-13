import TokenStorage from '@/services/token-storage.service';
import { Tokens, TokensSchema } from '@/types/user.type';
import { normalizeError } from '@/utils/api-error';
import axios from 'axios';
import { Platform } from 'react-native';

export async function login(email: string, password: string): Promise<void> {
  let tokens: Tokens;

  try {
    // use axios here since we're not logged in yet
    const BASE_URL = process.env.BACKEND_URL || 'http://localhost:8080';
    const res = await axios.post(
      `${BASE_URL}/auth/login`,
      {
        email: email,
        password: password,
      },
      {
        headers: {
          'hkj-auth-client-type': Platform.OS === 'web' ? 'web' : 'mobile',
        },
        withCredentials: true,
      },
    );
    tokens = TokensSchema.parse(res.data);
  } catch (error) {
    normalizeError(error);
    return;
  }

  const { accessToken, refreshToken } = tokens;
  TokenStorage.setAccessToken(accessToken);
  if (refreshToken) {
    TokenStorage.setRefreshToken(refreshToken);
  }
}
