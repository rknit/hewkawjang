import {
  InferSelectModel,
  eq,
  and,
  desc,
  count,
} from 'drizzle-orm';
import { notificationTable } from '../db/schema';
import { db } from '../db';
import createHttpError from 'http-errors';

export type Notification = InferSelectModel<typeof notificationTable>;

export default class NotificationService {

  static async getNotificationsByUser(props: {
    userId: number;
    isRead?: boolean;
    offset?: number;
    limit?: number;
  }): Promise<Notification[]> {
    const { userId, isRead, offset = 0, limit = 20 } = props;

    const conditions = [eq(notificationTable.userId, userId)];

    if (isRead !== undefined) {
      conditions.push(eq(notificationTable.isRead, isRead));
    }

    const notifications = await db
      .select()
      .from(notificationTable)
      .where(and(...conditions))
      .orderBy(desc(notificationTable.createdAt))
      .offset(offset)
      .limit(limit);

    return notifications;
  }

  static async getUnreadCount(props: {
    userId: number;
  }): Promise<{ count: number }> {
    const { userId } = props;

    const result = await db
      .select({ value: count() })
      .from(notificationTable)
      .where(
        and(
          eq(notificationTable.userId, userId),
          eq(notificationTable.isRead, false),
        ),
      );

    return { count: result[0].value };
  }

  static async createNotification(
    data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>,
  ): Promise<Notification> {
    const newNotifications = await db
      .insert(notificationTable)
      .values(data)
      .returning();

    if (!newNotifications || newNotifications.length === 0) {
        throw new createHttpError.InternalServerError('Failed to create notification');
    }

    return newNotifications[0];
  }

  static async markAsRead(props: {
    notificationId: number;
    userId: number;
  }): Promise<void> {
    const { notificationId, userId } = props;

    await db
      .update(notificationTable)
      .set({ isRead: true })
      .where(
        and(
          eq(notificationTable.id, notificationId),
          eq(notificationTable.userId, userId),
        ),
      );
  }

  static async markAllAsRead(props: { userId: number }): Promise<void> {
    const { userId } = props;

    await db
      .update(notificationTable)
      .set({ isRead: true })
      .where(
        and(
          eq(notificationTable.userId, userId),
          eq(notificationTable.isRead, false),
        ),
      );
  }

  static async deleteNotification(props: {
    notificationId: number;
    userId: number;
  }): Promise<void> {
    const { notificationId, userId } = props;

    await db
      .delete(notificationTable)
      .where(
        and(
          eq(notificationTable.id, notificationId),
          eq(notificationTable.userId, userId),
        ),
      );
  }
}