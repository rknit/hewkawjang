export type NotificationType = 'reservation_status' | 'chat';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string | null;
  imageUrl: string | null;
  reservationId: number | null;
  notificationType: NotificationType;
  createdAt: string;
  isRead: boolean;
}
