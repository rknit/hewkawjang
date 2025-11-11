import createHttpError from 'http-errors';
import { hashPassword } from '../utils/hash';
import { adminsTable, restaurantTable } from '../db/schema';
import { db } from '../db';
import { eq, isNull, inArray, gt } from 'drizzle-orm';
import { Admin } from '../validators/admin.validator';
import RestaurantService from './restaurant.service';
import NotificationService from './notification.service';
import {
  reportsTable,
  reviewTable,
  usersTable,
  reservationTable,
} from '../db/schema';
import { and, sql, desc } from 'drizzle-orm';

export default class AdminService {
  static async getAdminById(adminId: number): Promise<Admin> {
    const [admin] = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.id, adminId))
      .limit(1);
    if (!admin) {
      throw createHttpError.NotFound('Admin not found');
    }

    return admin;
  }

  static async banRestaurant(restaurantId: number): Promise<void> {
    const restaurant = await RestaurantService.getRestaurantById(restaurantId);
    if (!restaurant) {
      throw createHttpError.NotFound('Restaurant not found');
    }

    if (restaurant.isDeleted) {
      throw createHttpError.BadRequest('Restaurant is already deleted');
    }

    // Notify the restaurant owner about the ban
    await NotificationService.createNotifications([
      {
        userId: restaurant.ownerId,
        title: 'Your restaurant has been banned',
        message: `Your restaurant "${restaurant.name}" has been banned by an admin.`,
        imageUrl: restaurant.images?.[0] || null,
        notificationType: 'system',
      },
    ]);

    // Soft delete the restaurant
    await RestaurantService.deleteRestaurant(restaurantId);
  }

  // NOTE: This method is only for development purposes
  static async createAdminBypass(data: {
    email: string;
    password: string;
  }): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      throw createHttpError.Forbidden(
        'Admin bypass creation is only allowed in development mode',
      );
    }

    const hashedPassword = await hashPassword(data.password);
    await db
      .insert(adminsTable)
      .values({
        email: data.email,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'McAdminFace',
        phoneNo: '000-000-0000',
      })
      .onConflictDoNothing();
  }

  /**
   * Fetch reported reviews for the admin.
   * @param {boolean} isSolved - Flag to check if the report is solved or not.
   * @param {number} page - The page number for pagination.
   * @param {number} limit - The limit of records per page.
   * @returns {Promise<any[]>} - List of reported reviews.
   */

  static async getReportedReviews({
    isSolved = false,
    page = 1,
    limit = 10,
  }: {
    isSolved?: boolean | string;
    page?: number;
    limit?: number;
  }): Promise<any[]> {
    if (page < 1 || limit < 1) {
      throw createHttpError.BadRequest('Invalid page or limit');
    }

    const offset = (page - 1) * limit;
    const isSolvedBool = String(isSolved) === 'true'; // Convert isSolved to boolean if it's a string

    // First, fetch the unresolved reports (where isSolved is false)
    const unresolvedReviewsQuery = db
      .select({ targetReviewId: reportsTable.targetReviewId })
      .from(reportsTable)
      .where(eq(reportsTable.isSolved, false)); // Get unresolved reports (isSolved === false)

    // Now use `inArray` to filter out the reviews based on unresolvedReviewIds
    const reportedReviews = await db
      .select({
        id: reportsTable.id,
        userId: reportsTable.userId,
        adminId: reportsTable.adminId,
        reportType: reportsTable.reportType,
        targetRestaurantId: reportsTable.targetRestaurantId,
        targetReviewId: reportsTable.targetReviewId,
        targetUserId: reportsTable.targetUserId,
        targetChatId: reportsTable.targetChatId,
        isSolved: reportsTable.isSolved,
        createdAt: reportsTable.createdAt,

        // Review fields
        reviewId: reviewTable.id,
        reviewRating: reviewTable.rating,
        reviewComment: reviewTable.comment,
        reviewCreatedAt: reviewTable.createdAt,
        reviewAuthorId: reservationTable.userId,
        reviewAuthorName: usersTable.displayName,
        reviewImages: reviewTable.attachPhotos,
        userImage: usersTable.profileUrl,

        // Restaurant name from reservationTable
        reviewRestaurant: restaurantTable.name,
      })
      .from(reportsTable)
      .leftJoin(reviewTable, eq(reportsTable.targetReviewId, reviewTable.id))
      .leftJoin(
        reservationTable,
        eq(reviewTable.reservationId, reservationTable.id),
      )
      .leftJoin(usersTable, eq(reservationTable.userId, usersTable.id))
      .leftJoin(
        restaurantTable,
        eq(reservationTable.restaurantId, restaurantTable.id),
      )
      .where(
        and(
          eq(reportsTable.reportType, 'review'),
          inArray(reportsTable.targetReviewId, unresolvedReviewsQuery), // Filter using unresolved review ids
        ),
      )
      .orderBy(reportsTable.createdAt)
      .limit(limit)
      .offset(offset);

    return reportedReviews;
  }

  /**
   * Handle the reported review by either rejecting or banning the review.
   * @param {number} reportId - The ID of the reported review.
   * @param {boolean} action - True if the admin bans, false if they reject.
   * @returns {Promise<void>} - Resolves when the action is completed.
   */
  static async handleReportedReview(
    reportId: number,
    action: boolean,
  ): Promise<void> {
    // Fetch the reported review
    const [report] = await db
      .select()
      .from(reportsTable)
      .where(eq(reportsTable.id, reportId))
      .limit(1);

    console.log('reports what', report);
    if (!report) {
      throw createHttpError.NotFound('Report not found');
    }

    // If the report is already solved, throw an error
    if (report.isSolved) {
      throw createHttpError.BadRequest('This report has already been resolved');
    }

    // Mark the report as solved
    await db
      .update(reportsTable)
      .set({ isSolved: true })
      .where(eq(reportsTable.id, reportId));

    // If the admin chooses to ban the review
    if (action) {
      // Soft delete the user
      const userId = report.targetUserId;
      if (userId) {
        await db
          .update(usersTable)
          .set({ isDeleted: true })
          .where(eq(usersTable.id, userId));
      }

      // Soft delete the review
      const reviewId = report.targetReviewId;
      if (reviewId) {
        await db
          .update(reviewTable)
          .set({ isDeleted: true })
          .where(eq(reviewTable.id, reviewId));
      }
    }

    // If the action is to reject, we do nothing to the user or the review
  }

  /**
   * Handle the pending restaurant verification by either approving or deleting the restaurant.
   * @param {number} restaurantId - The ID of the restaurant.
   * @param {boolean} action - True if the admin approves, false if they reject.
   * @returns {Promise<void>} - Resolves when the action is completed.
   */
  static async updateRestaurantVerification(
    restaurantId: number,
    action: boolean,
  ): Promise<void> {
    // Fetch the restaurant
    const [restaurant] = await db
      .select()
      .from(restaurantTable)
      .where(eq(restaurantTable.id, restaurantId))
      .limit(1);

    if (!restaurant) {
      throw createHttpError.NotFound('Restaurant not found');
    }

    // Check if restaurant is already verified or deleted
    if (restaurant.isVerified) {
      throw createHttpError.BadRequest('Restaurant is already verified');
    }

    if (restaurant.isDeleted) {
      throw createHttpError.BadRequest('Restaurant is already deleted');
    }

    // If the admin approves the restaurant
    if (action) {
      // Set isVerified to true
      await db
        .update(restaurantTable)
        .set({ isVerified: true })
        .where(eq(restaurantTable.id, restaurantId));

      // Send approval notification to restaurant owner
      await NotificationService.createNotifications([
        {
          userId: restaurant.ownerId,
          title: 'Restaurant Verification Approved',
          message: `Your restaurant "${restaurant.name}" has been approved and is now live on HewKawJang!`,
          imageUrl: restaurant.images?.[0] || null,
          notificationType: 'system',
        },
      ]);
    } else {
      // Soft delete the restaurant
      await RestaurantService.deleteRestaurant(restaurantId);

      // Send rejection notification to restaurant owner
      await NotificationService.createNotifications([
        {
          userId: restaurant.ownerId,
          title: 'Restaurant Verification Rejected',
          message: `Your restaurant "${restaurant.name}" verification has been rejected. Please contact support for more details.`,
          imageUrl: restaurant.images?.[0] || null,
          notificationType: 'system',
        },
      ]);
    }
  }
}
