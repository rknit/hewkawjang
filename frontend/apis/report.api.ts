import ApiService from '@/services/api.service';
import { ReportSchema, Report } from '@/types/report.type';
import { normalizeError } from '@/utils/api-error';

export async function updateReportStatus(
  id: number,
  isSolved: boolean,
): Promise<Report | null> {
  try {
    const res = await ApiService.patch(`/reports/${id}`, { isSolved });
    return ReportSchema.parse(res.data);
  } catch (error) {
    return normalizeError(error);
  }
}
