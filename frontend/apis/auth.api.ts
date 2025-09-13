import ApiService from '@/services/api.service';
import TokenStorage from '@/services/token-storage.service';
import { Tokens, TokensSchema } from '@/types/user.type';
import { normalizeError } from '@/utils/api-error';
import { Platform } from 'react-native';

export async function login(email: string, password: string): Promise<void> {
  let tokens: Tokens;

  try {
    const res = await ApiService.post(
      '/auth/login',
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
