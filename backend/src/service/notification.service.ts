import {
  InferSelectModel,
  eq,
  and,
  desc,
  count,
  InferInsertModel,
} from 'drizzle-orm';
import { notificationTable } from '../db/schema';
import { db } from '../db';
import createHttpError from 'http-errors';
import { Reservation } from './reservation.service';
import UserService from './user.service';
import RestaurantService from './restaurant.service';
import {
  getUserReservationNotificationMessages,
  getRestaurantOwnerReservationNotificationMessages,
} from '../utils/notification-messages';

export type Notification = InferSelectModel<typeof notificationTable>;
export type NewNotification = InferInsertModel<typeof notificationTable>;
export type ReservationNotification = {
  reservation: Reservation;
  target: 'user' | 'restaurant_owner' | 'both';
};

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

  static async createNotifications(
    data: NewNotification[],
  ): Promise<Notification[]> {
    if (!data || data.length === 0) {
      return [];
    }

    const newNotifications = await db
      .insert(notificationTable)
      .values(data)
      .returning();

    if (!newNotifications || newNotifications.length === 0) {
      throw new createHttpError.InternalServerError(
        'Failed to create notifications',
      );
    }

    return newNotifications;
  }

  static async notifyNewReservation(reservation: Reservation): Promise<void> {
    const [user, restaurant] = await Promise.all([
      UserService.getUserById(reservation.userId),
      RestaurantService.getRestaurantById(reservation.restaurantId),
    ]);

    if (user && restaurant) {
      await NotificationService.createNotifications([
        {
          userId: restaurant.ownerId,
          notificationType: 'reservation_status',
          title: `New Reservation from ${user.displayName ?? user.firstName}`,
          message: `You have a new reservation. Please confirm availability or reject it within 10 minutes!`,
          reservationId: reservation.id,
          imageUrl: user.profileUrl,
        },
      ]);
    }
  }

  static async notifyReservationStatuses(
    reservationNotifications: ReservationNotification[],
  ): Promise<void> {
    if (!reservationNotifications || reservationNotifications.length === 0) {
      return;
    }

    // Extract unique user and restaurant IDs
    const userIds = [
      ...new Set(reservationNotifications.map((rn) => rn.reservation.userId)),
    ];
    const restaurantIds = [
      ...new Set(
        reservationNotifications.map((rn) => rn.reservation.restaurantId),
      ),
    ];

    // Fetch all users and restaurants in bulk (2 queries instead of 2N)
    const [users, restaurants] = await Promise.all([
      UserService.getUsers({ ids: userIds }),
      RestaurantService.getRestaurants({ ids: restaurantIds }),
    ]);

    // Create maps for O(1) lookup
    const userMap = new Map(users.map((u) => [u.id, u]));
    const restaurantMap = new Map(restaurants.map((r) => [r.id, r]));

    const notis: NewNotification[] = [];

    for (const { reservation, target } of reservationNotifications) {
      const user = userMap.get(reservation.userId);
      const restaurant = restaurantMap.get(reservation.restaurantId);

      if (!user || !restaurant) {
        throw new createHttpError.InternalServerError(
          'Failed to fetch user or restaurant for notification',
        );
      }

      // Create notification for user
      if (target === 'user' || target === 'both') {
        const { title, message } = getUserReservationNotificationMessages(
          reservation,
          restaurant.name,
        );

        notis.push({
          userId: user.id,
          notificationType: 'reservation_status',
          title,
          message,
          reservationId: reservation.id,
          // FIXME: consider adding restaurant image url
        });
      }

      // Create notification for restaurant owner
      if (target === 'restaurant_owner' || target === 'both') {
        const { title, message } =
          getRestaurantOwnerReservationNotificationMessages(
            reservation,
            restaurant.name,
            user.displayName ?? user.firstName,
          );

        notis.push({
          userId: restaurant.ownerId,
          notificationType: 'reservation_status',
          title,
          message,
          reservationId: reservation.id,
          imageUrl: user.profileUrl,
        });
      }
    }

    await NotificationService.createNotifications(notis);
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
