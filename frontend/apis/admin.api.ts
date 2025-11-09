import ApiService from '@/services/api.service';
import { Admin, AdminSchema } from '@/types/admin.type';
import { Report, ReportSchema } from '@/types/report.type';
import { normalizeError } from '@/utils/api-error';

export async function fetchCurrentAdmin(): Promise<Admin | null> {
  try {
    const res = await ApiService.get('/admins/me');
    return AdminSchema.parse(res.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function fetchPendingReportsForCurrentAdmin(): Promise<Report[]> {
  try {
    const res = await ApiService.get('/admins/me/reports/pending');
    return res.data.map((report: any) => ReportSchema.parse(report));
  } catch (error) {
    normalizeError(error);
    return [];
  }
}

export async function banRestaurant(restaurantId: number): Promise<void> {
  try {
    await ApiService.delete(`/admins/restaurants/${restaurantId}`);
  } catch (error) {
    normalizeError(error);
  }
}
