import { and, asc, eq } from 'drizzle-orm';
import { db } from '../db';
import { reportsTable } from '../db/schema';
import { Report, ReportUpdate } from '../validators/report.validator';

export default class ReportService {
  static async getPendingReportsAssignedToAdmin(
    adminId: number,
  ): Promise<Report[]> {
    const reports = db
      .select()
      .from(reportsTable)
      .where(
        and(
          eq(reportsTable.adminId, adminId),
          eq(reportsTable.isSolved, false),
        ),
      )
      .orderBy(asc(reportsTable.createdAt));

    return reports;
  }

  static async updateReport(
    id: number,
    data: ReportUpdate,
  ): Promise<Report | null> {
    const [updatedReport] = await db
      .update(reportsTable)
      .set(data)
      .where(eq(reportsTable.id, id))
      .returning();

    return updatedReport;
  }
}
