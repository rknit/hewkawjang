import ApiService from '@/services/api.service';
import { Admin, AdminSchema } from '@/types/admin.type';
import { normalizeError } from '@/utils/api-error';

export async function fetchCurrentAdmin(): Promise<Admin | null> {
  try {
    const res = await ApiService.get('/admins/me');
    return AdminSchema.parse(res.data);
  } catch (error) {
    return normalizeError(error);
  }
}
