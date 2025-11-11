import { and, asc, eq } from 'drizzle-orm';
import { db } from '../db';
import { reportsTable } from '../db/schema';
import { Report, ReportUpdate } from '../validators/report.validator';

export default class ReportService {
  static async getPendingReports(): Promise<Report[]> {
    return await db
      .select()
      .from(reportsTable)
      .where(eq(reportsTable.isSolved, false))
      .orderBy(asc(reportsTable.createdAt));
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

  static async reportRestaurant({
    reporterUserId,
    targetRestaurantId,
  }: {
    reporterUserId: number;
    targetRestaurantId: number;
  }): Promise<void> {
    await db.insert(reportsTable).values({
      userId: reporterUserId,
      targetRestaurantId: targetRestaurantId,
      reportType: 'restaurant',
    });
  }

  static async reportReview({
    reporterUserId,
    targetReviewId,
  }: {
    reporterUserId: number;
    targetReviewId: number;
  }): Promise<void> {
    // Check if this review has already been reported
    const existingReport = await db
      .select()
      .from(reportsTable)
      .where(
        and(
          eq(reportsTable.targetReviewId, targetReviewId),
          eq(reportsTable.reportType, 'review'),
        ),
      )
      .limit(1);

    // If report already exists, don't create duplicate
    if (existingReport.length > 0) {
      return;
    }

    await db.insert(reportsTable).values({
      userId: reporterUserId,
      targetReviewId: targetReviewId,
      reportType: 'review',
    });
  }
}
