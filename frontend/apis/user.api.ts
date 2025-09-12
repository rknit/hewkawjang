import ApiService from '@/services/api.service';
import TokenStorage from '@/services/token-storage.service';
import { User, UserSchema } from '@/types/user.type';
import { normalizeApiError } from '@/utils/api-error';

export async function tmpLogin() {
  try {
    const res = await ApiService.post(
      '/auth/login',
      {
        email: 'j.doe@gmail.com',
        password: 'janerat',
      },
      {
        headers: { 'hkj-auth-client-type': 'web' },
        withCredentials: true,
      },
    );

    let { accessToken } = res.data;
    TokenStorage.setAccessToken(accessToken);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchCurrentUser(): Promise<User> {
  try {
    const res = await ApiService.get('/users/me');
    return UserSchema.parse(res.data[0]);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
