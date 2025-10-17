import { z } from 'zod';

export const NotificationTypeEnum = z.enum(['reservation_status', 'chat']);

export const NotificationSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  message: z.string().nullable(),
  imageUrl: z.string().nullable(),
  reservationId: z.number().nullable(),
  notificationType: NotificationTypeEnum,
  createdAt: z.string(),
  isRead: z.boolean(),
});

export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationType = z.infer<typeof NotificationTypeEnum>;
