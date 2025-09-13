import ApiService from '@/services/api.service';
import { User, UserSchema } from '@/types/user.type';
import { normalizeError } from '@/utils/api-error';

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const res = await ApiService.get('/users/me');
    return UserSchema.parse(res.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function deleteCurrentUser(): Promise<boolean> {
  try {
    await ApiService.delete('/users/me');
    return true;
  } catch (error) {
    normalizeError(error);
    return false;
  }
}
